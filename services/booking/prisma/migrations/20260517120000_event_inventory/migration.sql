-- Migrate Event table to event_inventory with catalog linkage

CREATE TABLE IF NOT EXISTS "event_inventory" (
    "id" TEXT NOT NULL,
    "catalogEventId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "category" TEXT NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT,
    "ticketSalesClose" TIMESTAMP(3),
    "noteToAttendees" TEXT,
    "termsConditions" TEXT,
    "refundPolicy" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "event_inventory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "event_inventory_catalogEventId_key" ON "event_inventory"("catalogEventId");
CREATE INDEX IF NOT EXISTS "event_inventory_partnerId_idx" ON "event_inventory"("partnerId");
CREATE INDEX IF NOT EXISTS "event_inventory_venueId_idx" ON "event_inventory"("venueId");
CREATE INDEX IF NOT EXISTS "event_inventory_city_eventDate_isActive_idx" ON "event_inventory"("city", "eventDate", "isActive");
CREATE INDEX IF NOT EXISTS "event_inventory_eventDate_idx" ON "event_inventory"("eventDate");
CREATE INDEX IF NOT EXISTS "event_inventory_category_idx" ON "event_inventory"("category");

-- Copy legacy Event rows if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'Event') THEN
    INSERT INTO "event_inventory" (
      "id", "catalogEventId", "partnerId", "venueId", "city", "title", "description",
      "eventDate", "startTime", "endTime", "category", "totalSeats", "availableSeats",
      "basePrice", "imageUrl", "ticketSalesClose", "noteToAttendees", "termsConditions",
      "refundPolicy", "version", "isActive", "createdAt", "updatedAt"
    )
    SELECT
      "id", "id", "partnerId", "venueId", '', "title", "description",
      "eventDate", "startTime", "endTime", "category", "totalSeats", "availableSeats",
      "basePrice", "imageUrl", "ticketSalesClose", "noteToAttendees", "termsConditions",
      "refundPolicy", 0, "isActive", "createdAt", "updatedAt"
    FROM "Event"
    ON CONFLICT ("catalogEventId") DO NOTHING;
  END IF;
END $$;

-- Booking: add eventInventoryId, migrate from eventId
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "eventInventoryId" TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "idempotencyKey" TEXT;

UPDATE "Booking" b
SET "eventInventoryId" = b."eventId"
WHERE b."eventInventoryId" IS NULL AND EXISTS (
  SELECT 1 FROM "event_inventory" ei WHERE ei."id" = b."eventId"
);

ALTER TABLE "Ticket" ADD COLUMN IF NOT EXISTS "eventInventoryId" TEXT;
UPDATE "Ticket" t SET "eventInventoryId" = t."eventId"
WHERE t."eventInventoryId" IS NULL;

-- Drop old FKs and rename relations
ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "Booking_eventId_fkey";
ALTER TABLE "Ticket" DROP CONSTRAINT IF EXISTS "Ticket_eventId_fkey";

ALTER TABLE "Booking" DROP COLUMN IF EXISTS "eventId";
ALTER TABLE "Ticket" DROP COLUMN IF EXISTS "eventId";

ALTER TABLE "Booking" ALTER COLUMN "eventInventoryId" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Booking_idempotencyKey_key" ON "Booking"("idempotencyKey");
CREATE INDEX IF NOT EXISTS "Booking_eventInventoryId_idx" ON "Booking"("eventInventoryId");

ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "Booking_eventInventoryId_fkey";
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_eventInventoryId_fkey"
  FOREIGN KEY ("eventInventoryId") REFERENCES "event_inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "Ticket_eventInventoryId_idx" ON "Ticket"("eventInventoryId");

DROP TABLE IF EXISTS "Event";

CREATE TABLE IF NOT EXISTS "BookingOutbox" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookingOutbox_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BookingOutbox_processed_createdAt_idx" ON "BookingOutbox"("processed", "createdAt");
CREATE INDEX IF NOT EXISTS "BookingOutbox_bookingId_idx" ON "BookingOutbox"("bookingId");
