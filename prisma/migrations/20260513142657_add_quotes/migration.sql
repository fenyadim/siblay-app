-- CreateEnum
CREATE TYPE "QuoteType" AS ENUM ('MODELING', 'SCANNING');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('NEW', 'IN_REVIEW', 'QUOTED', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'NEW',
    "type" "QuoteType" NOT NULL,
    "description" TEXT NOT NULL,
    "desiredFormat" TEXT,
    "sourceType" TEXT,
    "objectWidth" DOUBLE PRECISION,
    "objectHeight" DOUBLE PRECISION,
    "objectLength" DOUBLE PRECISION,
    "location" TEXT,
    "needsReverse" BOOLEAN NOT NULL DEFAULT false,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "estimatedPrice" DOUBLE PRECISION,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteFile" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuoteFile" ADD CONSTRAINT "QuoteFile_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
