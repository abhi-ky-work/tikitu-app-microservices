-- DropForeignKey
ALTER TABLE "EventTicketTypes" DROP CONSTRAINT "EventTicketTypes_categoryCode_fkey";

-- DropForeignKey
ALTER TABLE "partner_addresses" DROP CONSTRAINT "partner_addresses_partnerId_fkey";

-- Rename Tables
ALTER TABLE "partner_addresses" RENAME TO "EventVenues";
ALTER TABLE "ticket_categories" RENAME TO "TicketCategories";

-- Rename Primary Keys
ALTER TABLE "TicketCategories" RENAME CONSTRAINT "ticket_categories_pkey" TO "TicketCategories_pkey";
ALTER TABLE "EventVenues" RENAME CONSTRAINT "partner_addresses_pkey" TO "EventVenues_pkey";

-- Rename Indexes
ALTER INDEX "ticket_categories_categoryCode_key" RENAME TO "TicketCategories_categoryCode_key";
ALTER INDEX "partner_addresses_partnerId_idx" RENAME TO "EventVenues_partnerId_idx";

-- AddForeignKey
ALTER TABLE "EventTicketTypes" ADD CONSTRAINT "EventTicketTypes_categoryCode_fkey" FOREIGN KEY ("categoryCode") REFERENCES "TicketCategories"("categoryCode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventVenues" ADD CONSTRAINT "EventVenues_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partnerProfiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
