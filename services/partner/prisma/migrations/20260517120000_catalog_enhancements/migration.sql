-- CreateEnum
CREATE TYPE "VenueType" AS ENUM ('CLUB', 'ARENA', 'CORPORATE_HALL', 'OTHER');
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');
CREATE TYPE "EventType" AS ENUM ('CLUB_NIGHT', 'SPORTS', 'CORPORATE', 'PRIVATE', 'OTHER');

-- PartnerMember
CREATE TABLE IF NOT EXISTS "PartnerMember" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "cognitoId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PartnerMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "PartnerMember_cognitoId_key" ON "PartnerMember"("cognitoId");
CREATE INDEX IF NOT EXISTS "PartnerMember_partnerId_idx" ON "PartnerMember"("partnerId");

ALTER TABLE "PartnerMember" DROP CONSTRAINT IF EXISTS "PartnerMember_partnerId_fkey";
ALTER TABLE "PartnerMember" ADD CONSTRAINT "PartnerMember_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partnerProfiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Venue enhancements
ALTER TABLE "Venue" ADD COLUMN IF NOT EXISTS "venueType" "VenueType" NOT NULL DEFAULT 'CLUB';
ALTER TABLE "Venue" ADD COLUMN IF NOT EXISTS "metadata" JSONB NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS "Venue_venueType_idx" ON "Venue"("venueType");

-- Event enhancements
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "venueId" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "eventType" "EventType" NOT NULL DEFAULT 'CLUB_NIGHT';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "status" "EventStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "metadata" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Event_venueId_idx" ON "Event"("venueId");
CREATE INDEX IF NOT EXISTS "Event_status_idx" ON "Event"("status");
CREATE INDEX IF NOT EXISTS "Event_eventDate_idx" ON "Event"("eventDate");

ALTER TABLE "Event" DROP CONSTRAINT IF EXISTS "Event_venueId_fkey";
ALTER TABLE "Event" ADD CONSTRAINT "Event_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Venue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Existing draft events with historical isActive flag (if column exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Event' AND column_name = 'isActive'
  ) THEN
    UPDATE "Event" SET "status" = 'PUBLISHED' WHERE "status" = 'DRAFT' AND "isActive" = true;
  END IF;
END $$;
