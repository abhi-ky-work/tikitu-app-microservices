/*
  Warnings:

  - You are about to drop the column `status` on the `Event` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "TicketCategoryCode" ADD VALUE 'PL4';

-- DropIndex
DROP INDEX "Event_status_idx";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "status",
ADD COLUMN     "addressId" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "eventStatus" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- CreateTable
CREATE TABLE "partner_addresses" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "customAddressName" TEXT NOT NULL,
    "addressLine1" TEXT NOT NULL,
    "addressLine2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'IN',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partner_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "partner_addresses_partnerId_idx" ON "partner_addresses"("partnerId");

-- CreateIndex
CREATE INDEX "Event_eventStatus_idx" ON "Event"("eventStatus");

-- AddForeignKey
ALTER TABLE "partner_addresses" ADD CONSTRAINT "partner_addresses_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partnerProfiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
