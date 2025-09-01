import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET /api/concerts - Get all concerts with artists
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userProfileId = searchParams.get('userProfileId');

    // Build the where clause
    const whereClause = userProfileId ? { userProfileId } : {};

    const concerts = await prisma.concert.findMany({
      where: whereClause,
      include: {
        concertArtists: {
          include: {
            artist: true, // Include artist details
          },
        },
      },
      orderBy: {
        date: 'desc', // Most recent concerts first
      },
    });

    return NextResponse.json({
      success: true,
      data: concerts,
      count: concerts.length,
    });
  } catch (error) {
    console.error('Error fetching concerts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch concerts',
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
