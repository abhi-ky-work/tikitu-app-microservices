/*
  Warnings:

  - The primary key for the `ticket_categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `code` on the `ticket_categories` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[categoryCode]` on the table `ticket_categories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryCode` to the `ticket_categories` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TicketType" DROP CONSTRAINT "TicketType_categoryCode_fkey";

-- AlterTable
ALTER TABLE "ticket_categories" DROP CONSTRAINT "ticket_categories_pkey",
DROP COLUMN "code",
ADD COLUMN     "categoryCode" "TicketCategoryCode" NOT NULL,
ADD CONSTRAINT "ticket_categories_pkey" PRIMARY KEY ("categoryCode");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_categories_categoryCode_key" ON "ticket_categories"("categoryCode");

-- AddForeignKey
ALTER TABLE "TicketType" ADD CONSTRAINT "TicketType_categoryCode_fkey" FOREIGN KEY ("categoryCode") REFERENCES "ticket_categories"("categoryCode") ON DELETE RESTRICT ON UPDATE CASCADE;
