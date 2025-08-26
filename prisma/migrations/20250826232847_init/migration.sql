-- CreateTable
CREATE TABLE "public"."user_profiles" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."concerts" (
    "id" SERIAL NOT NULL,
    "user_profile_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "rating" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."artists" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "artists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."concert_artists" (
    "id" SERIAL NOT NULL,
    "concert_id" INTEGER NOT NULL,
    "artist_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "concert_artists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."genres" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."artist_genres" (
    "id" SERIAL NOT NULL,
    "artist_id" TEXT NOT NULL,
    "genre_id" INTEGER NOT NULL,

    CONSTRAINT "artist_genres_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_email_key" ON "public"."user_profiles"("email");

-- AddForeignKey
ALTER TABLE "public"."concerts" ADD CONSTRAINT "concerts_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."concert_artists" ADD CONSTRAINT "concert_artists_concert_id_fkey" FOREIGN KEY ("concert_id") REFERENCES "public"."concerts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."concert_artists" ADD CONSTRAINT "concert_artists_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."artist_genres" ADD CONSTRAINT "artist_genres_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."artist_genres" ADD CONSTRAINT "artist_genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "public"."genres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
