/*
  Warnings:

  - You are about to drop the `TicketType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TicketType" DROP CONSTRAINT "TicketType_categoryCode_fkey";

-- DropForeignKey
ALTER TABLE "TicketType" DROP CONSTRAINT "TicketType_eventId_fkey";

-- DropTable
DROP TABLE "TicketType";

-- CreateTable
CREATE TABLE "EventTicketTypes" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "categoryCode" "TicketCategoryCode" NOT NULL,

    CONSTRAINT "EventTicketTypes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventTicketTypes_eventId_idx" ON "EventTicketTypes"("eventId");

-- CreateIndex
CREATE INDEX "EventTicketTypes_categoryCode_idx" ON "EventTicketTypes"("categoryCode");

-- AddForeignKey
ALTER TABLE "EventTicketTypes" ADD CONSTRAINT "EventTicketTypes_categoryCode_fkey" FOREIGN KEY ("categoryCode") REFERENCES "ticket_categories"("categoryCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventTicketTypes" ADD CONSTRAINT "EventTicketTypes_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
