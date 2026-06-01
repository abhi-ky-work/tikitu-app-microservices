import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CognitoAuthModule } from '@tikitu/common';
import { HealthModule } from './health/health.module';
import { EventsModule } from './events/events.module';
import { PartnerModule } from './partner/partner.module';
import { TicketCategoriesModule } from './ticket-categories/ticket-categories.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CognitoAuthModule,
    PrismaModule,
    HealthModule,
    PartnerModule,
    EventsModule,
    TicketCategoriesModule,
  ],
})
export class AppModule {}
