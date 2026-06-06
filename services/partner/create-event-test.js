const { PrismaClient } = require('./prisma/generated/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Attempt to create a dummy event with the same ticketTypes logic
    const event = await prisma.event.create({
      data: {
        partnerId: 'dummy-partner-id', // Assuming there's no FK constraint on partnerId or we need a real one
        name: 'Test Event',
        category: 'music',
        eventDate: new Date(),
        startTime: '18:00',
        venueName: 'Sunset Arena',
        location: 'Los Angeles, CA',
        eventStatus: 0,
        ticketTypes: {
          create: [
            {
              name: 'Couple Ticket',
              price: 9,
              quantity: 99,
              categoryCode: 'CUP',
            },
            {
              name: 'Girls (Free Shots)',
              price: 9,
              quantity: 99,
              categoryCode: 'GRL',
            }
          ]
        }
      }
    });
    console.log("Success:", event.id);
  } catch (err) {
    console.error("PRISMA ERROR:", err);
  }
}
main().finally(() => prisma.$disconnect());
