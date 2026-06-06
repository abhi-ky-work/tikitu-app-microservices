import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.ticketCategory.upsert({ where: { categoryCode: 'CUP' }, update: {}, create: { name: 'Couple', categoryCode: 'CUP' } });
  await prisma.ticketCategory.upsert({ where: { categoryCode: 'GRL' }, update: {}, create: { name: 'Girls', categoryCode: 'GRL' } });
  await prisma.ticketCategory.upsert({ where: { categoryCode: 'STD' }, update: {}, create: { name: 'Standard', categoryCode: 'STD' } });
  console.log('Seeded');
}
main().catch(console.error).finally(() => prisma.$disconnect());
