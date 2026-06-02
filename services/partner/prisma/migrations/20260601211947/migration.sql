/*
  Warnings:

  - The values [PL4] on the enum `TicketCategoryCode` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TicketCategoryCode_new" AS ENUM ('EBD', 'PH2', 'PH3', 'PH4', 'LSL', 'CUP', 'GRL', 'STD', 'GR4', 'LGR');
ALTER TABLE "ticket_categories" ALTER COLUMN "categoryCode" TYPE "TicketCategoryCode_new" USING ("categoryCode"::text::"TicketCategoryCode_new");
ALTER TABLE "TicketType" ALTER COLUMN "categoryCode" TYPE "TicketCategoryCode_new" USING ("categoryCode"::text::"TicketCategoryCode_new");
ALTER TYPE "TicketCategoryCode" RENAME TO "TicketCategoryCode_old";
ALTER TYPE "TicketCategoryCode_new" RENAME TO "TicketCategoryCode";
DROP TYPE "public"."TicketCategoryCode_old";
COMMIT;
