import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/concerts - Get all concerts with artists
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userProfileId = searchParams.get("userProfileId");

    // Build the where clause
    const whereClause = userProfileId ? { userProfileId } : {};

    const concerts = await prisma.concert.findMany({
      where: whereClause,
      include: {
        userProfile: true, // Include user profile details
        concertArtists: {
          include: {
            artist: true, // Include artist details
          },
        },
      },
      orderBy: {
        date: "desc", // Most recent concerts first
      },
    });

    return NextResponse.json({
      success: true,
      data: concerts,
      count: concerts.length,
    });
  } catch (error) {
    console.error("Error fetching concerts:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch concerts",
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST /api/concerts - Create new concert
export async function POST(request) {
  try {
    const body = await request.json();
    const { date, venue, city, rating, notes, userProfileId, artists } = body;

    // Validate required fields
    if (!date || !venue || !city || !userProfileId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: date, venue, city, userProfileId",
        },
        { status: 400 }
      );
    }

    // Verify user profile exists
    const userProfile = await prisma.userProfile.findUnique({
      where: { id: userProfileId },
    });

    if (!userProfile) {
      return NextResponse.json(
        {
          success: false,
          error: "User profile not found",
        },
        { status: 404 }
      );
    }

    // Start a transaction to create concert and artists
    const result = await prisma.$transaction(async (tx) => {
      // Create the concert
      const newConcert = await tx.concert.create({
        data: {
          date: new Date(date),
          venue,
          city,
          rating: rating || null,
          notes: notes || null,
          userProfileId,
        },
      });

      // If artists are provided, create concert artists
      if (artists && Array.isArray(artists)) {
        for (const artist of artists) {
          if (artist.artistId && artist.role) {
            // Verify artist exists
            const existingArtist = await tx.artist.findUnique({
              where: { id: artist.artistId },
            });

            if (existingArtist) {
              await tx.concertArtist.create({
                data: {
                  concertId: newConcert.id,
                  artistId: artist.artistId,
                  role: artist.role,
                },
              });
            }
          }
        }
      }

      // Return the created concert with relations
      return await tx.concert.findUnique({
        where: { id: newConcert.id },
        include: {
          userProfile: true,
          concertArtists: {
            include: {
              artist: true,
            },
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: "Concert created successfully",
    });
  } catch (error) {
    console.error("Error creating concert:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create concert",
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
