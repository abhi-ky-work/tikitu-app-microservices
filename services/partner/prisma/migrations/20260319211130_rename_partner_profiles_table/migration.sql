/*
  Warnings:

  - You are about to drop the `Partner` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_partnerId_fkey";

-- DropForeignKey
ALTER TABLE "Venue" DROP CONSTRAINT "Venue_partnerId_fkey";

-- DropTable
DROP TABLE "Partner";

-- CreateTable
CREATE TABLE "partnerProfiles" (
    "id" TEXT NOT NULL,
    "cognitoId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "commission" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partnerProfiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partnerProfiles_cognitoId_key" ON "partnerProfiles"("cognitoId");

-- CreateIndex
CREATE UNIQUE INDEX "partnerProfiles_email_key" ON "partnerProfiles"("email");

-- CreateIndex
CREATE INDEX "partnerProfiles_cognitoId_idx" ON "partnerProfiles"("cognitoId");

-- CreateIndex
CREATE INDEX "partnerProfiles_email_idx" ON "partnerProfiles"("email");

-- AddForeignKey
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partnerProfiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partnerProfiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
