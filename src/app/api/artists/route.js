import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { findOrCreateArtist } from "../../../services/artistService.js";

const prisma = new PrismaClient();

// GET /api/artists - Get all artists
export async function GET() {
  try {
    const artists = await prisma.artist.findMany({
      include: {
        artistGenres: {
          include: {
            genre: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(artists);
  } catch (error) {
    console.error("Error fetching artists:", error);
    return NextResponse.json(
      { error: "Failed to fetch artists" },
      { status: 500 }
    );
  }
}

// POST /api/artists - Create or find an artist
export async function POST(request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Artist name is required" },
        { status: 400 }
      );
    }

    const artist = await findOrCreateArtist(name.trim());

    return NextResponse.json(artist, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/artists:", error);

    // Handle specific error types
    if (error.message.includes("No artists found")) {
      return NextResponse.json(
        { error: "Artist not found on Spotify" },
        { status: 404 }
      );
    }

    if (error.message.includes("Spotify API error")) {
      return NextResponse.json(
        { error: "Spotify service temporarily unavailable" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create or find artist" },
      { status: 500 }
    );
  }
}
