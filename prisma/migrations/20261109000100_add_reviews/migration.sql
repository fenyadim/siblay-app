CREATE TABLE IF NOT EXISTS "Review" (
    "id" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "reviewDate" TIMESTAMP(3) NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Review_published_reviewDate_idx" ON "Review"("published", "reviewDate");
