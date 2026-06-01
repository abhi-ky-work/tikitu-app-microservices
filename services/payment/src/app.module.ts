import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CognitoAuthModule } from '@tikitu/common';
import { HealthModule } from './health/health.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CognitoAuthModule,
    PrismaModule,
    HealthModule,
    PaymentsModule,
  ],
})
export class AppModule {}
