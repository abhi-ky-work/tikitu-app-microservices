import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AuthUser } from '@tikitu/common';
import { EventStatus, Prisma } from '../../prisma/generated/client';
import { BookingClientService } from '../partner/booking-client.service';
import { PartnerProfileService } from '../partner/partner-profile.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly partnerProfile: PartnerProfileService,
    private readonly bookingClient: BookingClientService,
  ) {}

  async createDraftEvent(user: AuthUser, data: Record<string, unknown>) {
    const partnerId = await this.partnerProfile.resolvePartnerId(user.sub);

    const parsed = this.parseEventPayload(data);
    const { ticketTypes, venueId, ...eventFields } = parsed;

    const event = await this.prisma.event.create({
      data: {
        ...eventFields,
        partnerId,
        venueId: venueId || null,
        status: EventStatus.DRAFT,
        ticketTypes: ticketTypes?.length
          ? {
              create: ticketTypes.map((tt) => ({
                name: tt.name,
                price: tt.price,
                quantity: tt.quantity,
                categoryCode: (tt.categoryCode as any) || 'STD',
              })),
            }
          : undefined,
      },
      include: { ticketTypes: true },
    });

    return event;
  }

  async listPartnerEvents(user: AuthUser, status?: EventStatus) {
    const partnerId = await this.partnerProfile.resolvePartnerId(user.sub);

    return this.prisma.event.findMany({
      where: {
        partnerId,
        ...(status ? { status } : {}),
      },
      include: { ticketTypes: true, venue: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async publishEvent(user: AuthUser, eventId: string) {
    const partnerId = await this.partnerProfile.resolvePartnerId(user.sub);

    const event = await this.prisma.event.findFirst({
      where: { id: eventId, partnerId },
      include: { ticketTypes: true, venue: true },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.status === EventStatus.PUBLISHED) {
      throw new BadRequestException('Event is already published');
    }

    if (event.status === EventStatus.CANCELLED) {
      throw new BadRequestException('Cannot publish a cancelled event');
    }

    const totalSeats = event.ticketTypes.reduce((sum, tt) => sum + tt.quantity, 0);
    const basePrice =
      event.ticketTypes.length > 0
        ? Math.min(...event.ticketTypes.map((tt) => tt.price))
        : 0;

    if (totalSeats <= 0) {
      throw new BadRequestException('Event must have at least one ticket type with quantity');
    }

    const city = event.venue?.city || this.extractCityFromLocation(event.location);
    const venueId = event.venueId || event.venue?.id;

    if (!venueId) {
      throw new BadRequestException('Event must be linked to a venue (venueId) before publish');
    }

    const startDateTime = new Date(`${event.eventDate.toISOString().split('T')[0]}T${event.startTime}`);
    let endDateTime = startDateTime;
    if (event.endTime) {
      endDateTime = new Date(
        `${event.eventDate.toISOString().split('T')[0]}T${event.endTime}`,
      );
    }

    const inventory = await this.bookingClient.publishInventory({
      catalogEventId: event.id,
      partnerId,
      venueId,
      city,
      title: event.name,
      description: event.description,
      eventDate: event.eventDate.toISOString(),
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      category: event.category,
      totalSeats,
      basePrice,
      imageUrl: event.backgroundImage,
      ticketSalesClose: event.ticketSalesClose?.toISOString() ?? null,
      noteToAttendees: event.noteToAttendees,
      termsConditions: event.termsConditions,
      refundPolicy: event.refundPolicy,
      ticketTypes: event.ticketTypes.map((tt) => ({
        id: tt.id,
        name: tt.name,
        categoryCode: tt.categoryCode,
        price: tt.price,
        quantity: tt.quantity,
      })),
    });

    const updated = await this.prisma.event.update({
      where: { id: event.id },
      data: {
        status: EventStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      include: { ticketTypes: true },
    });

    return { catalogEvent: updated, inventory };
  }

  private parseEventPayload(data: Record<string, unknown>) {
    const {
      name,
      category,
      description,
      eventDate,
      startTime,
      endTime,
      venueName,
      venueId,
      location,
      ticketSalesClose,
      noteToAttendees,
      termsConditions,
      refundPolicy,
      ticketTypes,
      backgroundImage,
      eventType,
    } = data as {
      name?: string;
      category?: string;
      description?: string;
      eventDate?: string;
      startTime?: string;
      endTime?: string;
      venueName?: string;
      venueId?: string;
      location?: string;
      ticketSalesClose?: string;
      noteToAttendees?: string;
      termsConditions?: string;
      refundPolicy?: string;
      ticketTypes?: Array<{ name: string; price: number; quantity: number; categoryCode?: string }>;
      backgroundImage?: string;
      eventType?: string;
    };

    if (!name || !category || !eventDate || !startTime || !venueName) {
      throw new BadRequestException('Missing required fields');
    }

    return {
      name,
      category,
      description,
      eventDate: new Date(eventDate),
      startTime,
      endTime: endTime || null,
      venueName,
      location: location || venueName,
      venueId,
      backgroundImage,
      eventType: (eventType as Prisma.EventCreateInput['eventType']) || undefined,
      ticketSalesClose: ticketSalesClose ? new Date(ticketSalesClose) : null,
      noteToAttendees,
      termsConditions,
      refundPolicy,
      ticketTypes,
    };
  }

  private extractCityFromLocation(location: string): string {
    const parts = location.split(',').map((p) => p.trim());
    return parts.length >= 2 ? parts[parts.length - 2] : location;
  }
}
