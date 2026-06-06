import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RolesGuard } from '@tikitu/common';
import { BookingClientService } from '../partner/booking-client.service';
import { PartnerProfileService } from '../partner/partner-profile.service';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'partner-service',
            brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
          },
          producerOnlyMode: true,
        },
      },
    ]),
  ],
  controllers: [EventsController],
  providers: [EventsService, PartnerProfileService, BookingClientService, RolesGuard],
})
export class EventsModule {}
