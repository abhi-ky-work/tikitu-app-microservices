import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InternalApiKeyGuard, InternalRoute } from '@tikitu/common';
import { NotificationsService } from './notifications.service';

@Controller('v1/internal/notifications')
@InternalRoute()
@UseGuards(InternalApiKeyGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async create(@Body() body: {
    userId: string;
    bookingId: string;
    bookingRef: string;
    title: string;
  }) {
    return this.notificationsService.sendBookingConfirmation(body);
  }
}
