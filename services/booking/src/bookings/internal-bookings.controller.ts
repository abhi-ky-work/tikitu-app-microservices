import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InternalApiKeyGuard, InternalRoute } from '@tikitu/common';
import { BookingsService } from './bookings.service';

@Controller('v1/internal/bookings')
@InternalRoute()
@UseGuards(InternalApiKeyGuard)
export class InternalBookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post('confirm')
  async confirm(
    @Body() body: { bookingId: string; paymentId: string },
  ) {
    return this.bookingsService.confirmBooking(body.bookingId, body.paymentId);
  }
}
