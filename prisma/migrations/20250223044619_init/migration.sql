-- CreateEnum
CREATE TYPE "AudioFileConversionStatus" AS ENUM ('USER_UPLOAD', 'CHECKING', 'CONVERTING', 'RE_UPLOAD', 'DONE', 'ERROR');

-- CreateTable
CREATE TABLE "Show" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TEXT,
    "timeZone" TEXT NOT NULL,
    "backgroundColor" TEXT,
    "backgroundColorSecondary" TEXT,
    "logoImageFileId" TEXT,
    "backgroundImageFileId" TEXT,

    CONSTRAINT "Show_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Set" (
    "id" TEXT NOT NULL,
    "artist" TEXT,
    "offset" DOUBLE PRECISION,
    "showId" TEXT NOT NULL,
    "audioFileId" TEXT,

    CONSTRAINT "Set_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioFile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "duration" DOUBLE PRECISION,
    "conversionStatus" "AudioFileConversionStatus" NOT NULL,
    "conversionProgress" DOUBLE PRECISION,
    "errorMessage" TEXT,

    CONSTRAINT "AudioFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImageFile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "ImageFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUserAllowlist" (
    "emailAddress" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Show_slug_key" ON "Show"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Show_logoImageFileId_key" ON "Show"("logoImageFileId");

-- CreateIndex
CREATE UNIQUE INDEX "Show_backgroundImageFileId_key" ON "Show"("backgroundImageFileId");

-- CreateIndex
CREATE UNIQUE INDEX "Set_audioFileId_key" ON "Set"("audioFileId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUserAllowlist_emailAddress_key" ON "AdminUserAllowlist"("emailAddress");

-- AddForeignKey
ALTER TABLE "Show" ADD CONSTRAINT "Show_logoImageFileId_fkey" FOREIGN KEY ("logoImageFileId") REFERENCES "ImageFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Show" ADD CONSTRAINT "Show_backgroundImageFileId_fkey" FOREIGN KEY ("backgroundImageFileId") REFERENCES "ImageFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Set" ADD CONSTRAINT "Set_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Set" ADD CONSTRAINT "Set_audioFileId_fkey" FOREIGN KEY ("audioFileId") REFERENCES "AudioFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
