import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  findOrCreateArtist,
  findOrCreateGenreAndLink,
} from "../../../services/artistService.js";

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

    // Debug: Log the incoming date
    console.log("POST - Incoming date:", date);
    console.log("POST - Date type:", typeof date);

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

    // Validate rating (allow empty/null, else 1-5)
    const parsedRating =
      rating === "" || rating == null ? null : parseInt(rating, 10);
    if (
      parsedRating !== null &&
      (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Rating must be between 1-5 or empty",
        },
        { status: 400 }
      );
    }

    // Validate artists array
    if (!artists || !Array.isArray(artists) || artists.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one artist is required",
        },
        { status: 400 }
      );
    }

    // Filter valid artists (must include a name and role)
    const validArtists = artists.filter(
      (artist) => artist?.name && artist?.role
    );
    if (validArtists.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "All artists must include a name and role",
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

    // Resolve all artists first (outside transaction)
    const resolvedArtists = [];
    for (const a of validArtists) {
      // 1. Get/create artist from Spotify
      const resolved = await findOrCreateArtist(a.name);

      // 2. Add user-provided genres (if any)
      if (a.genres && a.genres.length > 0) {
        for (const genreName of a.genres) {
          await findOrCreateGenreAndLink(genreName, resolved.id);
        }
      }

      // 3. Store for concert creation
      resolvedArtists.push({ artistId: resolved.id, role: a.role });
    }

    // Start a transaction to create concert and artists
    const result = await prisma.$transaction(async (tx) => {
      // Parse the date - handle both UTC ISO strings and datetime-local format
      let parsedDate;
      if (date.includes("T") && date.includes("Z")) {
        // Already a UTC ISO string
        parsedDate = new Date(date);
        console.log("POST - Using UTC ISO string:", date, "->", parsedDate);
      } else {
        // datetime-local format, convert to UTC
        parsedDate = new Date(date + ":00.000Z");
        console.log("POST - Using datetime-local:", date, "->", parsedDate);
      }

      // Validate the date
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date format");
      }

      console.log("POST - Final parsed date:", parsedDate);

      // Create the concert
      const newConcert = await tx.concert.create({
        data: {
          date: parsedDate,
          venue,
          city,
          rating: parsedRating,
          notes: notes || null,
          userProfileId,
        },
      });

      // Create concert artists from resolved artists
      for (const artist of resolvedArtists) {
        await tx.concertArtist.create({
          data: {
            concertId: newConcert.id,
            artistId: artist.artistId,
            role: artist.role,
          },
        });
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
