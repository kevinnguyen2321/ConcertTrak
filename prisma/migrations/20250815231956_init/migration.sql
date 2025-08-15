-- CreateTable
CREATE TABLE "public"."user_profile" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."concert" (
    "id" SERIAL NOT NULL,
    "user_profile_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "venue" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "rating" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."artist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."concert_artist" (
    "id" SERIAL NOT NULL,
    "concert_id" INTEGER NOT NULL,
    "artist_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,

    CONSTRAINT "concert_artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."genre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."artist_genre" (
    "id" SERIAL NOT NULL,
    "artist_id" TEXT NOT NULL,
    "genre_id" INTEGER NOT NULL,

    CONSTRAINT "artist_genre_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_email_key" ON "public"."user_profile"("email");

-- AddForeignKey
ALTER TABLE "public"."concert" ADD CONSTRAINT "concert_user_profile_id_fkey" FOREIGN KEY ("user_profile_id") REFERENCES "public"."user_profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."concert_artist" ADD CONSTRAINT "concert_artist_concert_id_fkey" FOREIGN KEY ("concert_id") REFERENCES "public"."concert"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."concert_artist" ADD CONSTRAINT "concert_artist_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."artist_genre" ADD CONSTRAINT "artist_genre_artist_id_fkey" FOREIGN KEY ("artist_id") REFERENCES "public"."artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."artist_genre" ADD CONSTRAINT "artist_genre_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "public"."genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
