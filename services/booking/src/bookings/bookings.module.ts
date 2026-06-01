import { Module } from '@nestjs/common';
import { InternalApiKeyGuard, RolesGuard } from '@tikitu/common';
import { RateLimitGuard } from '../guards/rate-limit.guard';
import { InventoryModule } from '../inventory/inventory.module';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';
import { InternalBookingsController } from './internal-bookings.controller';
import { NotificationClientService } from './notification-client.service';
import { PaymentClientService } from './payment-client.service';

@Module({
  imports: [InventoryModule],
  controllers: [BookingsController, InternalBookingsController],
  providers: [
    BookingsService,
    PaymentClientService,
    NotificationClientService,
    RolesGuard,
    InternalApiKeyGuard,
    RateLimitGuard,
  ],
  exports: [BookingsService],
})
export class BookingsModule {}
