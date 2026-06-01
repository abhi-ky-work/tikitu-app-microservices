import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentMethod, PaymentStatus } from '../../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { BookingClientService } from './booking-client.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly bookingClient: BookingClientService,
  ) {}

  async createPayment(dto: {
    bookingId: string;
    userId: string;
    amount: number;
    paymentMethod: string;
    idempotencyKey: string;
  }) {
    const existing = await this.prisma.payment.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
    });
    if (existing) {
      return { data: existing };
    }

    const byBooking = await this.prisma.payment.findUnique({
      where: { bookingId: dto.bookingId },
    });
    if (byBooking) {
      throw new ConflictException('Payment already exists for booking');
    }

    const method = dto.paymentMethod.toUpperCase() as PaymentMethod;
    if (!Object.values(PaymentMethod).includes(method)) {
      throw new BadRequestException('Invalid payment method');
    }

    const payment = await this.prisma.payment.create({
      data: {
        bookingId: dto.bookingId,
        userId: dto.userId,
        amount: dto.amount,
        paymentMethod: method,
        status: PaymentStatus.PENDING,
        idempotencyKey: dto.idempotencyKey,
      },
    });

    await this.prisma.paymentOutbox.create({
      data: {
        paymentId: payment.id,
        bookingId: dto.bookingId,
        eventType: 'PAYMENT_CREATED',
        payload: { amount: dto.amount },
      },
    });

    return { data: payment };
  }

  async capturePayment(paymentId: string, idempotencyKey?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      return payment;
    }

    const transactionId = `txn_${Date.now()}_${payment.id.slice(0, 8)}`;

    const updated = await this.prisma.$transaction(async (tx) => {
      const captured = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.COMPLETED,
          transactionId,
          gatewayResponse: { simulated: true, idempotencyKey },
        },
      });

      await tx.paymentLog.create({
        data: {
          paymentId,
          action: 'CAPTURED',
          details: { transactionId },
        },
      });

      await tx.paymentOutbox.create({
        data: {
          paymentId,
          bookingId: payment.bookingId,
          eventType: 'PAYMENT_CAPTURED',
          payload: { transactionId },
        },
      });

      return captured;
    });

    await this.bookingClient.confirmBooking(payment.bookingId, payment.id);

    return updated;
  }
}
