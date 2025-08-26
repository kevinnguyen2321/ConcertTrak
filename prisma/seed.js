const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample genres
  const rock = await prisma.genre.create({
    data: { name: 'Rock' },
  });

  const pop = await prisma.genre.create({
    data: { name: 'Pop' },
  });

  const jazz = await prisma.genre.create({
    data: { name: 'Jazz' },
  });

  const hipHop = await prisma.genre.create({
    data: { name: 'Hip Hop' },
  });

  console.log('✅ Genres created');

  // Create sample artists with Spotify-style IDs
  const queen = await prisma.artist.create({
    data: {
      id: '1dfeR4HaWDbWqFHLkxsg1d', // Queen's actual Spotify ID
      name: 'Queen',
      artistGenres: {
        create: [{ genreId: rock.id }],
      },
    },
  });

  const beatles = await prisma.artist.create({
    data: {
      id: '3WrFJ7ztbogyGnTHbHJFl2', // The Beatles' actual Spotify ID
      name: 'The Beatles',
      artistGenres: {
        create: [{ genreId: rock.id }, { genreId: pop.id }],
      },
    },
  });

  const milesDavis = await prisma.artist.create({
    data: {
      id: '0kbYTNQb4Pb1rPbbaF0pT4', // Miles Davis' actual Spotify ID
      name: 'Miles Davis',
      artistGenres: {
        create: [{ genreId: jazz.id }],
      },
    },
  });

  console.log('✅ Artists created');

  // Create sample user
  const john = await prisma.userProfile.create({
    data: {
      email: 'john@example.com',
      displayName: 'John Doe',
    },
  });

  console.log('✅ User created');

  // Create sample concerts
  const concert1 = await prisma.concert.create({
    data: {
      userProfileId: john.id,
      date: new Date('2024-06-15'),
      venue: 'Madison Square Garden',
      city: 'New York',
      rating: 5,
      notes: 'Amazing show! Freddie Mercury was incredible.',
      concertArtists: {
        create: [{ artistId: queen.id, role: 'Headliner' }],
      },
    },
  });

  const concert2 = await prisma.concert.create({
    data: {
      userProfileId: john.id,
      date: new Date('2024-07-20'),
      venue: 'The Fillmore',
      city: 'San Francisco',
      rating: 4,
      notes: 'Great jazz night, intimate venue.',
      concertArtists: {
        create: [{ artistId: milesDavis.id, role: 'Headliner' }],
      },
    },
  });

  console.log('✅ Concerts created');

  console.log('🎉 Database seeded successfully!');
  console.log(`Created ${await prisma.genre.count()} genres`);
  console.log(`Created ${await prisma.artist.count()} artists`);
  console.log(`Created ${await prisma.userProfile.count()} users`);
  console.log(`Created ${await prisma.concert.count()} concerts`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
