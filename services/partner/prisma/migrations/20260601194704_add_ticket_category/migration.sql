/*
  Warnings:

  - You are about to drop the column `isActive` on the `Event` table. All the data in the column will be lost.
  - Added the required column `categoryCode` to the `TicketType` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TicketCategoryCode" AS ENUM ('EBD', 'PH2', 'PH3', 'PH4', 'LSL', 'CUP', 'GRL', 'STD', 'GR4', 'PL4');

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "isActive";

-- AlterTable
ALTER TABLE "TicketType" ADD COLUMN     "categoryCode" "TicketCategoryCode" NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ticket_categories" (
    "code" "TicketCategoryCode" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticket_categories_pkey" PRIMARY KEY ("code")
);

-- CreateIndex
CREATE INDEX "PartnerMember_cognitoId_idx" ON "PartnerMember"("cognitoId");

-- CreateIndex
CREATE INDEX "TicketType_categoryCode_idx" ON "TicketType"("categoryCode");

-- AddForeignKey
ALTER TABLE "TicketType" ADD CONSTRAINT "TicketType_categoryCode_fkey" FOREIGN KEY ("categoryCode") REFERENCES "ticket_categories"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
