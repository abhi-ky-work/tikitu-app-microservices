import { Module } from '@nestjs/common';
import { RolesGuard } from '@tikitu/common';
import { BookingClientService } from './booking-client.service';
import { PartnerController } from './partner.controller';
import { PartnerProfileService } from './partner-profile.service';

@Module({
  controllers: [PartnerController],
  providers: [PartnerProfileService, BookingClientService, RolesGuard],
  exports: [PartnerProfileService, BookingClientService],
})
export class PartnerModule {}
