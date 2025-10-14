import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getArtistById } from "../../../../services/artistService.js";

const prisma = new PrismaClient();

// GET /api/artists/[id] - Get artist by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const artist = await getArtistById(id);

    return NextResponse.json(artist);
  } catch (error) {
    console.error("Error fetching artist:", error);

    if (error.message === "Artist not found") {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to fetch artist" },
      { status: 500 }
    );
  }
}

// DELETE /api/artists/[id] - Delete artist by ID
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Check if artist exists
    const artist = await prisma.artist.findUnique({
      where: { id },
      include: {
        concertArtists: true,
      },
    });

    if (!artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    // Check if artist is linked to any concerts
    if (artist.concertArtists.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete artist that is linked to concerts. Remove the artist from all concerts first.",
        },
        { status: 409 }
      );
    }

    // Delete the artist (cascade will handle artistGenres)
    await prisma.artist.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Artist deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting artist:", error);
    return NextResponse.json(
      { error: "Failed to delete artist" },
      { status: 500 }
    );
  }
}
