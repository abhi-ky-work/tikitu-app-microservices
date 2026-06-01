import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, TicketStatus } from '../../prisma/generated/client';
import { InventoryService } from '../inventory/inventory.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationClientService } from './notification-client.service';
import { PaymentClientService } from './payment-client.service';
import { randomBytes } from 'crypto';

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inventory: InventoryService,
    private readonly paymentClient: PaymentClientService,
    private readonly notificationClient: NotificationClientService,
  ) {}

  async createBooking(params: {
    cognitoUserId: string;
    userId: string;
    eventInventoryId: string;
    numberOfTickets: number;
    paymentMethod: string;
    idempotencyKey: string;
  }) {
    const { userId, eventInventoryId, numberOfTickets, paymentMethod, idempotencyKey } =
      params;

    if (numberOfTickets < 1) {
      throw new BadRequestException('numberOfTickets must be at least 1');
    }

    const existing = await this.prisma.booking.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      return existing;
    }

    const eventInventory = await this.prisma.eventInventory.findFirst({
      where: { id: eventInventoryId, isActive: true },
    });

    if (!eventInventory) {
      throw new NotFoundException('Event not found or not available');
    }

    const totalAmount = eventInventory.basePrice * numberOfTickets;
    const bookingRef = `TKT-${randomBytes(4).toString('hex').toUpperCase()}`;

    const decremented = await this.inventory.decrementSeats(
      eventInventoryId,
      numberOfTickets,
      eventInventory.version,
    );

    if (!decremented) {
      throw new ConflictException('Not enough seats available');
    }

    const booking = await this.prisma.booking.create({
      data: {
        eventInventoryId,
        userId,
        status: BookingStatus.PENDING,
        totalAmount,
        numberOfTickets,
        bookingRef,
        idempotencyKey,
      },
    });

    const payment = await this.paymentClient.createPayment({
      bookingId: booking.id,
      userId,
      amount: totalAmount,
      paymentMethod,
      idempotencyKey: `pay-${idempotencyKey}`,
    });

    const paymentId =
      (payment as { data?: { id: string }; id?: string }).data?.id ||
      (payment as { id?: string }).id;

    if (paymentId) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { paymentId },
      });
    }

    return { booking, payment };
  }

  async confirmBooking(bookingId: string, paymentId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { eventInventory: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === BookingStatus.CONFIRMED) {
      return booking;
    }

    if (booking.paymentId !== paymentId) {
      throw new BadRequestException('Payment does not match booking');
    }

    const tickets = await this.prisma.$transaction(async (tx) => {
      const confirmed = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
          confirmedAt: new Date(),
        },
      });

      const issued: Awaited<ReturnType<typeof tx.ticket.create>>[] = [];
      for (let i = 0; i < booking.numberOfTickets; i++) {
        const ticket = await tx.ticket.create({
          data: {
            bookingId: booking.id,
            eventInventoryId: booking.eventInventoryId,
            userId: booking.userId,
            ticketCode: `TK-${randomBytes(6).toString('hex').toUpperCase()}`,
            status: TicketStatus.ACTIVE,
            price: booking.eventInventory.basePrice,
          },
        });
        issued.push(ticket);
      }

      await tx.bookingOutbox.create({
        data: {
          bookingId: booking.id,
          eventType: 'BOOKING_CONFIRMED',
          payload: {
            bookingRef: booking.bookingRef,
            userId: booking.userId,
            eventTitle: booking.eventInventory.title,
          },
        },
      });

      return { confirmed, tickets: issued };
    });

    await this.notificationClient.sendBookingConfirmation({
      userId: booking.userId,
      bookingId: booking.id,
      bookingRef: booking.bookingRef,
      title: booking.eventInventory.title,
    });

    return tickets;
  }

  async cancelPendingBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking || booking.status !== BookingStatus.PENDING) {
      return null;
    }

    await this.prisma.eventInventory.update({
      where: { id: booking.eventInventoryId },
      data: { availableSeats: { increment: booking.numberOfTickets } },
    });

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED, cancelledAt: new Date() },
    });
  }
}
