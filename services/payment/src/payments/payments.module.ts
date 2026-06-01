import { Module } from '@nestjs/common';
import { InternalApiKeyGuard, RolesGuard } from '@tikitu/common';
import { BookingClientService } from './booking-client.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    BookingClientService,
    InternalApiKeyGuard,
    RolesGuard,
  ],
})
export class PaymentsModule {}
