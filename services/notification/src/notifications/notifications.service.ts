import { Injectable, Logger } from '@nestjs/common';
import { NotificationStatus, NotificationType } from '../../prisma/generated/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async sendBookingConfirmation(payload: {
    userId: string;
    bookingId: string;
    bookingRef: string;
    title: string;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        userId: payload.userId,
        type: NotificationType.EMAIL,
        status: NotificationStatus.PENDING,
        title: `Booking confirmed: ${payload.title}`,
        message: `Your booking ${payload.bookingRef} is confirmed. Present your tickets at the venue.`,
        data: {
          bookingId: payload.bookingId,
          bookingRef: payload.bookingRef,
        },
      },
    });

    // Simulated delivery (replace with SES/SNS in production)
    const sent = await this.prisma.notification.update({
      where: { id: notification.id },
      data: {
        status: NotificationStatus.SENT,
        sentAt: new Date(),
        channel: 'simulated-email',
      },
    });

    this.logger.log(`Notification sent for booking ${payload.bookingRef}`);
    return sent;
  }
}
