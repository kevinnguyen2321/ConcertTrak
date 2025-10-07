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

  // Check if artist already exists by Spotify ID
  let artist = await prisma.artist.findUnique({
    where: { id: spotifyArtist.id },
    include: {
      artistGenres: {
        include: {
          genre: true,
        },
      },
    },
  });

  if (!artist) {
    // Create the artist only if it doesn't exist
    artist = await prisma.artist.create({
      data: {
        id: spotifyArtist.id,
        name: spotifyArtist.name,
        imageUrl: spotifyArtist.images[0]?.url || null,
      },
    });

    // Handle genres for newly created artist
    console.log(
      `Processing genres for ${spotifyArtist.name}:`,
      spotifyArtist.genres
    );
    if (spotifyArtist.genres && spotifyArtist.genres.length > 0) {
      for (const genreName of spotifyArtist.genres) {
        console.log(
          `Creating/linking genre: ${genreName} for artist: ${artist.id}`
        );
        await findOrCreateGenreAndLink(genreName, artist.id);
      }
    } else {
      console.log(`No genres found for ${spotifyArtist.name}`);
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
  } else {
    // Artist already exists, return it
    console.log(`Artist ${spotifyArtist.name} already exists in database`);
    return artist;
  }
}

// Find or create genre and link to artist
export async function findOrCreateGenreAndLink(genreName, artistId) {
  try {
    console.log(
      `Starting genre processing for: ${genreName}, artist: ${artistId}`
    );

    // Find or create genre (case-insensitive search, lowercase storage)
    let genre = await prisma.genre.findFirst({
      where: {
        name: {
          equals: genreName,
          mode: "insensitive",
        },
      },
    });

    if (!genre) {
      console.log(`Creating new genre: ${genreName}`);
      genre = await prisma.genre.create({
        data: {
          name: genreName.toLowerCase(),
        },
      });
      console.log(`Created genre with ID: ${genre.id}`);
    } else {
      console.log(`Found existing genre: ${genreName} with ID: ${genre.id}`);
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
      console.log(
        `Creating artistGenre link: artistId=${artistId}, genreId=${genre.id}`
      );
      await prisma.artistGenre.create({
        data: {
          artistId: artistId,
          genreId: genre.id,
        },
      });
      console.log(`Successfully created artistGenre link`);
    } else {
      console.log(`ArtistGenre link already exists`);
    }
  } catch (error) {
    console.error(`Error in findOrCreateGenreAndLink for ${genreName}:`, error);
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
