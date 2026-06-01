import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { defaultCorsConfig } from '@tikitu/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors(defaultCorsConfig);
  const port = process.env.PORT || process.env.PAYMENT_SERVICE_PORT || 3003;
  await app.listen(port);
  console.log(`payment service listening on port ${port}`);
}

bootstrap();
