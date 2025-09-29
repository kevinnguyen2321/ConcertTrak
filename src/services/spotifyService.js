import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get a valid access token, refreshing if necessary
export async function getValidToken() {
  try {
    // Get token from database
    const tokenRecord = await prisma.spotifyToken.findUnique({
      where: { id: "main" },
    });

    // Check if token is expired or about to expire (within 5 minutes)
    const isExpired =
      !tokenRecord ||
      !tokenRecord.accessToken ||
      tokenRecord.expiresAt <= new Date(Date.now() + 300000);

    if (isExpired) {
      return await refreshToken();
    }

    return tokenRecord.accessToken;
  } catch (error) {
    console.error("Error getting valid token:", error);
    // If database error, try to refresh token
    return await refreshToken();
  }
}

// Refresh the access token
async function refreshToken() {
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.SPOTIFY_CLIENT_ID,
        client_secret: process.env.SPOTIFY_CLIENT_SECRET,
      }),
    });

    if (!response.ok) {
      throw new Error(`Spotify token refresh failed: ${response.status}`);
    }

    const data = await response.json();

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);

    // Store in database using upsert
    await prisma.spotifyToken.upsert({
      where: { id: "main" },
      update: {
        accessToken: data.access_token,
        expiresAt: expiresAt,
        requestedAt: new Date(),
      },
      create: {
        id: "main",
        accessToken: data.access_token,
        expiresAt: expiresAt,
        requestedAt: new Date(),
      },
    });

    console.log("Spotify token refreshed and stored in database");
    return data.access_token;
  } catch (error) {
    console.error("Error refreshing Spotify token:", error);
    throw new Error("Failed to refresh Spotify token");
  }
}

// Search for artists on Spotify
export async function searchArtists(query) {
  try {
    const token = await getValidToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        query
      )}&type=artist&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        // Token might be invalid, try refreshing
        const newToken = await refreshToken();
        const retryResponse = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(
            query
          )}&type=artist&limit=1`,
          {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          }
        );

        if (!retryResponse.ok) {
          throw new Error(`Spotify API error: ${retryResponse.status}`);
        }

        return await retryResponse.json();
      }

      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data = await response.json();

    if (
      !data.artists ||
      !data.artists.items ||
      data.artists.items.length === 0
    ) {
      throw new Error(`No artists found for query: ${query}`);
    }

    return data;
  } catch (error) {
    console.error("Error searching Spotify:", error);
    throw error;
  }
}
