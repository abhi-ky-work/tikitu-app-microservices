import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import {
  AuthenticatedRequest,
  Roles,
  RolesGuard,
} from '@tikitu/common';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import { BookingsService } from './bookings.service';

@Controller('v1/bookings')
@UseGuards(RolesGuard, RateLimitGuard)
@Roles('user')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      userId: string;
      eventInventoryId: string;
      numberOfTickets: number;
      paymentMethod: string;
      idempotencyKey: string;
    },
  ) {
    return this.bookingsService.createBooking({
      cognitoUserId: req.user!.sub,
      userId: body.userId,
      eventInventoryId: body.eventInventoryId,
      numberOfTickets: body.numberOfTickets,
      paymentMethod: body.paymentMethod,
      idempotencyKey: body.idempotencyKey,
    });
  }
}
