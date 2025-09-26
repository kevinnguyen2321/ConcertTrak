import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/genres/[id] - Fetch genre by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const genreId = parseInt(id);

    if (isNaN(genreId)) {
      return NextResponse.json({ error: "Invalid genre ID" }, { status: 400 });
    }

    const genre = await prisma.genre.findUnique({
      where: {
        id: genreId,
      },
      include: {
        artistGenres: {
          include: {
            artist: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!genre) {
      return NextResponse.json({ error: "Genre not found" }, { status: 404 });
    }

    return NextResponse.json(genre);
  } catch (error) {
    console.error("Error fetching genre:", error);
    return NextResponse.json(
      { error: "Failed to fetch genre" },
      { status: 500 }
    );
  }
}

// PUT /api/genres/[id] - Update genre
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const genreId = parseInt(id);

    if (isNaN(genreId)) {
      return NextResponse.json({ error: "Invalid genre ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Genre name is required" },
        { status: 400 }
      );
    }

    // Check if genre exists
    const existingGenre = await prisma.genre.findUnique({
      where: {
        id: genreId,
      },
    });

    if (!existingGenre) {
      return NextResponse.json({ error: "Genre not found" }, { status: 404 });
    }

    // Check if another genre with the same name exists
    const duplicateGenre = await prisma.genre.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },
        NOT: {
          id: genreId,
        },
      },
    });

    if (duplicateGenre) {
      return NextResponse.json(
        { error: "Genre with this name already exists" },
        { status: 409 }
      );
    }

    const updatedGenre = await prisma.genre.update({
      where: {
        id: genreId,
      },
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(updatedGenre);
  } catch (error) {
    console.error("Error updating genre:", error);
    return NextResponse.json(
      { error: "Failed to update genre" },
      { status: 500 }
    );
  }
}

// DELETE /api/genres/[id] - Delete genre
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const genreId = parseInt(id);

    if (isNaN(genreId)) {
      return NextResponse.json({ error: "Invalid genre ID" }, { status: 400 });
    }

    // Check if genre exists
    const existingGenre = await prisma.genre.findUnique({
      where: {
        id: genreId,
      },
      include: {
        artistGenres: true,
      },
    });

    if (!existingGenre) {
      return NextResponse.json({ error: "Genre not found" }, { status: 404 });
    }

    // Check if genre is associated with any artists
    if (existingGenre.artistGenres.length > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete genre that is associated with artists. Remove all artist associations first.",
        },
        { status: 409 }
      );
    }

    await prisma.genre.delete({
      where: {
        id: genreId,
      },
    });

    return NextResponse.json(
      { message: "Genre deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting genre:", error);
    return NextResponse.json(
      { error: "Failed to delete genre" },
      { status: 500 }
    );
  }
}


