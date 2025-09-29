import { PrismaClient } from "@prisma/client";
import { searchArtists } from "./spotifyService.js";

const prisma = new PrismaClient();

// Main function to find or create an artist
export async function findOrCreateArtist(artistName) {
  try {
    // Check if artist already exists in local database
    let artist = await prisma.artist.findFirst({
      where: {
        name: {
          contains: artistName,
          mode: "insensitive",
        },
      },
      include: {
        artistGenres: {
          include: {
            genre: true,
          },
        },
      },
    });

    if (!artist) {
      // Search Spotify for the artist
      const spotifyData = await searchArtists(artistName);

      // Create artist with genres
      artist = await createArtistWithGenres(spotifyData);
    }

    return artist;
  } catch (error) {
    console.error("Error in findOrCreateArtist:", error);
    throw error;
  }
}

// Create artist and handle genres
async function createArtistWithGenres(spotifyData) {
  const spotifyArtist = spotifyData.artists.items[0];

  // Create the artist
  const artist = await prisma.artist.create({
    data: {
      id: spotifyArtist.id,
      name: spotifyArtist.name,
      imageUrl: spotifyArtist.images[0]?.url || null,
    },
  });

  // Handle genres
  if (spotifyArtist.genres && spotifyArtist.genres.length > 0) {
    for (const genreName of spotifyArtist.genres) {
      await findOrCreateGenreAndLink(genreName, artist.id);
    }
  }

  // Return artist with genres included
  return await prisma.artist.findUnique({
    where: { id: artist.id },
    include: {
      artistGenres: {
        include: {
          genre: true,
        },
      },
    },
  });
}

// Find or create genre and link to artist
async function findOrCreateGenreAndLink(genreName, artistId) {
  try {
    // Find or create genre
    let genre = await prisma.genre.findFirst({
      where: { name: genreName },
    });

    if (!genre) {
      genre = await prisma.genre.create({
        data: { name: genreName },
      });
    }

    // Check if relationship already exists
    const existingLink = await prisma.artistGenre.findFirst({
      where: {
        artistId: artistId,
        genreId: genre.id,
      },
    });

    // Only create if it doesn't exist
    if (!existingLink) {
      await prisma.artistGenre.create({
        data: {
          artistId: artistId,
          genreId: genre.id,
        },
      });
    }
  } catch (error) {
    console.error("Error in findOrCreateGenreAndLink:", error);
    // Don't throw error here to avoid breaking artist creation
  }
}

// Get artist by ID
export async function getArtistById(artistId) {
  try {
    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
      include: {
        artistGenres: {
          include: {
            genre: true,
          },
        },
      },
    });

    if (!artist) {
      throw new Error("Artist not found");
    }

    return artist;
  } catch (error) {
    console.error("Error in getArtistById:", error);
    throw error;
  }
}
