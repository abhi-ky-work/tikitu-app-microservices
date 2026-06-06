import { Module } from '@nestjs/common';
import { EventVenuesController } from './event-venues.controller';
import { EventVenuesService } from './event-venues.service';

@Module({
  controllers: [EventVenuesController],
  providers: [EventVenuesService],
  exports: [EventVenuesService],
})
export class EventVenuesModule {}
