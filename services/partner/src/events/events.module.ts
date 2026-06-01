import { Module } from '@nestjs/common';
import { RolesGuard } from '@tikitu/common';
import { BookingClientService } from '../partner/booking-client.service';
import { PartnerProfileService } from '../partner/partner-profile.service';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  controllers: [EventsController],
  providers: [EventsService, PartnerProfileService, BookingClientService, RolesGuard],
})
export class EventsModule {}
