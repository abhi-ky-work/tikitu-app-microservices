import { Body, Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  AuthenticatedRequest,
  InternalApiKeyGuard,
  InternalRoute,
  Roles,
  RolesGuard,
} from '@tikitu/common';
import { PaymentsService } from './payments.service';

@Controller('v1')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @InternalRoute()
  @UseGuards(InternalApiKeyGuard)
  @Post('internal/payments')
  async createInternal(
    @Body()
    body: {
      bookingId: string;
      userId: string;
      amount: number;
      paymentMethod: string;
      idempotencyKey: string;
    },
  ) {
    return this.paymentsService.createPayment(body);
  }

  @Post('payments/:id/capture')
  @UseGuards(RolesGuard)
  @Roles('user')
  async capture(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.paymentsService.capturePayment(id, req.user?.sub);
  }
}
