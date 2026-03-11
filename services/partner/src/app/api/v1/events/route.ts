import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  console.log('POST request received partner/events');
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the partner by cognitoId
    const partner = await prisma.partner.findUnique({
      where: { cognitoId: user.sub },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner profile not found' }, { status: 404 });
    }

    const data = await request.json();

    // Validation
    const { 
      name, 
      category, 
      description, 
      eventDate, 
      startTime, 
      endTime, 
      venueName, 
      location, 
      ticketSalesClose,
      ticketTypes,
      noteToAttendees,
      termsConditions,
      refundPolicy
    } = data;

    if (!name || !category || !eventDate || !startTime || !venueName || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create the event
    const event = await prisma.event.create({
      data: {
        partnerId: partner.id,
        name,
        category,
        description,
        backgroundImage: data.backgroundImage || 'https://via.placeholder.com/800x400?text=Event+Image', // Placeholder
        eventDate: new Date(eventDate),
        startTime,
        endTime,
        venueName,
        location,
        ticketSalesClose: ticketSalesClose ? new Date(ticketSalesClose) : null,
        noteToAttendees,
        termsConditions,
        refundPolicy,
        ticketTypes: {
          create: ticketTypes.map((tt: any) => ({
            name: tt.name,
            price: parseFloat(tt.price),
            quantity: parseInt(tt.quantity),
          })),
        },
      },
      include: {
        ticketTypes: true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partner = await prisma.partner.findUnique({
      where: { cognitoId: user.sub },
    });

    if (!partner) {
      return NextResponse.json({ error: 'Partner profile not found' }, { status: 404 });
    }

    const events = await prisma.event.findMany({
      where: { partnerId: partner.id },
      include: { ticketTypes: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
