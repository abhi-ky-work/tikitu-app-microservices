import { PrismaClient } from './generated/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new Pool({ connectionString: process.env.PARTNER_DATABASE_URL || 'postgresql://tikitu:tikitu_password@localhost:5432/partner_db' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ticketCategoriesData = [
  {
    categoryCode: "EBD" as const,
    name: "Early Bird",
    description: "Discounted early access tickets"
  },
  {
    categoryCode: "PH2" as const,
    name: "Phase 2",
    description: "Second phase of ticket sales"
  },
  {
    categoryCode: "PH3" as const,
    name: "Phase 3",
    description: "Third phase of ticket sales"
  },
  {
    categoryCode: "PH4" as const,
    name: "Phase 4",
    description: "Fourth phase of ticket sales"
  },
  {
    categoryCode: "LSL" as const,
    name: "Last Slot",
    description: "Final remaining tickets before event"
  },
  {
    categoryCode: "CUP" as const,
    name: "Couples",
    description: "Entry for one couple (2 people)"
  },
  {
    categoryCode: "GRL" as const,
    name: "Girls",
    description: "Entry for single female"
  },
  {
    categoryCode: "STD" as const,
    name: "Standard",
    description: "General admission tickets"
  },
  {
    categoryCode: "GR4" as const,
    name: "Group Of 4",
    description: "Discounted entry for a group of exactly 4 people"
  },
  {
    categoryCode: "LGR" as const,
    name: "Group of 4+",
    description: "Discounted entry for large groups (4 or more)"
  }
];

async function main() {
  console.log('Seeding TicketCategories...');
  
  for (const category of ticketCategoriesData) {
    await prisma.ticketCategories.upsert({
      where: { categoryCode: category.categoryCode },
      update: {
        name: category.name,
        description: category.description,
      },
      create: category,
    });
  }
  
  console.log('Seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
