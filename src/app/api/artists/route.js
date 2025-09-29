import { NextResponse } from "next/server";
import { findOrCreateArtist } from "../../../services/artistService.js";

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
