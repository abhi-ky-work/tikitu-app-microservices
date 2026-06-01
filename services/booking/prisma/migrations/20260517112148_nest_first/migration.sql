-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "noteToAttendees" TEXT,
ADD COLUMN     "refundPolicy" TEXT,
ADD COLUMN     "termsConditions" TEXT,
ADD COLUMN     "ticketSalesClose" TIMESTAMP(3);
