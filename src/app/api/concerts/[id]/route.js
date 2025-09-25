import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// GET /api/concerts/[id] - Get concert by ID
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const concertId = parseInt(id);

    if (isNaN(concertId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid concert ID",
        },
        { status: 400 }
      );
    }

    const concert = await prisma.concert.findUnique({
      where: { id: concertId },
      include: {
        userProfile: true,
        concertArtists: {
          include: {
            artist: true,
          },
        },
      },
    });

    if (!concert) {
      return NextResponse.json(
        {
          success: false,
          error: "Concert not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: concert,
    });
  } catch (error) {
    console.error("Error fetching concert:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch concert",
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/concerts/[id] - Update concert by ID
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const concertId = parseInt(id);

    if (isNaN(concertId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid concert ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { date, venue, city, rating, notes, userProfileId, artists } = body;

    // Coerce rating to int or null
    const parsedRating =
      rating === "" || rating === null || rating === undefined
        ? null
        : parseInt(rating, 10);

    // Validate rating
    if (
      parsedRating !== null &&
      (Number.isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5)
    ) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1-5 or empty" },
        { status: 400 }
      );
    }

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

    // Check if concert exists
    const existingConcert = await prisma.concert.findUnique({
      where: { id: concertId },
    });

    if (!existingConcert) {
      return NextResponse.json(
        {
          success: false,
          error: "Concert not found",
        },
        { status: 404 }
      );
    }

    // Start a transaction to update concert and artists
    const result = await prisma.$transaction(async (tx) => {
      // Parse the date - handle both UTC ISO strings and datetime-local format
      let parsedDate;
      if (date.includes("T") && date.includes("Z")) {
        // Already a UTC ISO string
        parsedDate = new Date(date);
      } else {
        // datetime-local format, convert to UTC
        parsedDate = new Date(date + ":00.000Z");
      }

      // Validate the date
      if (isNaN(parsedDate.getTime())) {
        throw new Error("Invalid date format");
      }

      // Update the concert
      const updatedConcert = await tx.concert.update({
        where: { id: concertId },
        data: {
          date: parsedDate,
          venue,
          city,
          rating: parsedRating,
          notes: notes || null,
          userProfileId,
        },
      });

      // If artists are provided, update them
      if (artists && Array.isArray(artists)) {
        // Delete existing concert artists
        await tx.concertArtist.deleteMany({
          where: { concertId },
        });

        // Create new concert artists
        for (const artist of artists) {
          if (artist.artistId && artist.role) {
            await tx.concertArtist.create({
              data: {
                concertId,
                artistId: artist.artistId,
                role: artist.role,
              },
            });
          }
        }
      }

      // Return the updated concert with relations
      return await tx.concert.findUnique({
        where: { id: concertId },
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
      message: "Concert updated successfully",
    });
  } catch (error) {
    console.error("Error updating concert:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update concert",
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE /api/concerts/[id] - Delete concert by ID
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const concertId = parseInt(id);

    if (isNaN(concertId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid concert ID",
        },
        { status: 400 }
      );
    }

    // Check if concert exists
    const existingConcert = await prisma.concert.findUnique({
      where: { id: concertId },
    });

    if (!existingConcert) {
      return NextResponse.json(
        {
          success: false,
          error: "Concert not found",
        },
        { status: 404 }
      );
    }

    // Delete the concert (cascade will handle concert artists)
    await prisma.concert.delete({
      where: { id: concertId },
    });

    return NextResponse.json({
      success: true,
      message: "Concert deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting concert:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete concert",
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
