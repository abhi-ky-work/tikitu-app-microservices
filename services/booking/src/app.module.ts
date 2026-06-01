import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CognitoAuthModule } from '@tikitu/common';
import { BookingsModule } from './bookings/bookings.module';
import { DeprecatedEventsModule } from './events/deprecated-events.module';
import { HealthModule } from './health/health.module';
import { InventoryModule } from './inventory/inventory.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CognitoAuthModule,
    PrismaModule,
    RedisModule,
    HealthModule,
    InventoryModule,
    BookingsModule,
    DeprecatedEventsModule,
  ],
})
export class AppModule {}
