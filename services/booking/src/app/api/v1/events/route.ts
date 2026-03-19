import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  console.log('POST request received booking/events');
  try {
    const user = await authenticateRequest(request);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In Booking service, we don't have a Partner table. We will use the cognito sub as partnerId directly.
    const partnerId = user.sub;

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
      ticketTypes
    } = data;

    if (!name || !category || !eventDate || !startTime || !venueName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Determine total seats and base price from ticketTypes payload
    let totalSeats = 0;
    let basePrice = 0;
    if (ticketTypes && Array.isArray(ticketTypes) && ticketTypes.length > 0) {
      totalSeats = ticketTypes.reduce((acc: number, tt: any) => acc + (parseInt(tt.quantity) || 0), 0);
      basePrice = Math.min(...ticketTypes.map((tt: any) => parseFloat(tt.price) || 0));
    } else {
      totalSeats = data.totalSeats ? parseInt(data.totalSeats) : 100;
      basePrice = data.basePrice ? parseFloat(data.basePrice) : 0;
    }

    // Create the event using Booking microservice schema
    const event = await prisma.event.create({
      data: {
        partnerId: partnerId,
        venueId: data.venueId || venueName, // Fallback to venueName if venueId is not provided
        title: name,
        category,
        description,
        imageUrl: data.backgroundImage || 'https://via.placeholder.com/800x400?text=Event+Image',
        eventDate: new Date(eventDate),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        totalSeats: totalSeats,
        availableSeats: totalSeats,
        basePrice: basePrice,
      }
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

    const partnerId = user.sub;

    const events = await prisma.event.findMany({
      where: { partnerId: partnerId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(events);
  } catch (error: any) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
