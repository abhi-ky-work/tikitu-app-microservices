-- Drop role index and column (partner/admin live in their own services)
DROP INDEX IF EXISTS "User_role_idx";
ALTER TABLE "User" DROP COLUMN IF EXISTS "role";

-- Drop UserRole enum if unused
DROP TYPE IF EXISTS "UserRole";

CREATE TABLE IF NOT EXISTS "FavoriteVenue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FavoriteVenue_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "FavoriteVenue_userId_venueId_key" ON "FavoriteVenue"("userId", "venueId");
CREATE INDEX IF NOT EXISTS "FavoriteVenue_userId_idx" ON "FavoriteVenue"("userId");

ALTER TABLE "FavoriteVenue" DROP CONSTRAINT IF EXISTS "FavoriteVenue_userId_fkey";
ALTER TABLE "FavoriteVenue" ADD CONSTRAINT "FavoriteVenue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
