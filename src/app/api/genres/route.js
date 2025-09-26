import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/genres - Fetch all genres
export async function GET() {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(genres);
  } catch (error) {
    console.error("Error fetching genres:", error);
    return NextResponse.json(
      { error: "Failed to fetch genres" },
      { status: 500 }
    );
  }
}

// POST /api/genres - Create a new genre
export async function POST(request) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Genre name is required" },
        { status: 400 }
      );
    }

    // Check if genre already exists
    const existingGenre = await prisma.genre.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existingGenre) {
      return NextResponse.json(
        { error: "Genre with this name already exists" },
        { status: 409 }
      );
    }

    const genre = await prisma.genre.create({
      data: {
        name: name.trim(),
      },
    });

    return NextResponse.json(genre, { status: 201 });
  } catch (error) {
    console.error("Error creating genre:", error);
    return NextResponse.json(
      { error: "Failed to create genre" },
      { status: 500 }
    );
  }
}
