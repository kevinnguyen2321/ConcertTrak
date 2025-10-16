const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create sample genres
  const rock = await prisma.genre.create({
    data: { name: "Rock" },
  });

  const pop = await prisma.genre.create({
    data: { name: "Pop" },
  });

  const jazz = await prisma.genre.create({
    data: { name: "Jazz" },
  });

  const hipHop = await prisma.genre.create({
    data: { name: "Hip Hop" },
  });

  const electronic = await prisma.genre.create({
    data: { name: "Electronic" },
  });

  const country = await prisma.genre.create({
    data: { name: "Country" },
  });

  const metal = await prisma.genre.create({
    data: { name: "Metal" },
  });

  const indie = await prisma.genre.create({
    data: { name: "Indie" },
  });

  console.log("✅ Genres created");

  // Create sample artists with Spotify-style IDs
  const queen = await prisma.artist.create({
    data: {
      id: "1dfeR4HaWDbWqFHLkxsg1d", // Queen's actual Spotify ID
      name: "Queen",
      imageUrl: null,
      artistGenres: {
        create: [{ genreId: rock.id }],
      },
    },
  });

  const beatles = await prisma.artist.create({
    data: {
      id: "3WrFJ7ztbogyGnTHbHJFl2", // The Beatles' actual Spotify ID
      name: "The Beatles",
      imageUrl: null,
      artistGenres: {
        create: [{ genreId: rock.id }, { genreId: pop.id }],
      },
    },
  });

  const milesDavis = await prisma.artist.create({
    data: {
      id: "0kbYTNQb4Pb1rPbbaF0pT4", // Miles Davis' actual Spotify ID
      name: "Miles Davis",
      imageUrl: null,
      artistGenres: {
        create: [{ genreId: jazz.id }],
      },
    },
  });

  const taylorSwift = await prisma.artist.create({
    data: {
      id: "06HL4z0CvFAxyc27GXpf02", // Taylor Swift's actual Spotify ID
      name: "Taylor Swift",
      imageUrl: null,
      artistGenres: {
        create: [{ genreId: pop.id }, { genreId: country.id }],
      },
    },
  });

  const daftPunk = await prisma.artist.create({
    data: {
      id: "4tZwfgrHOc3mvqYlEYSvVi", // Daft Punk's actual Spotify ID
      name: "Daft Punk",
      imageUrl: null,
      artistGenres: {
        create: [{ genreId: electronic.id }],
      },
    },
  });

  console.log("✅ Artists created");

  console.log("🎉 Database seeded successfully!");
  console.log(`Created ${await prisma.genre.count()} genres`);
  console.log(`Created ${await prisma.artist.count()} artists`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
