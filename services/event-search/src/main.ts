import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Connect Kafka Microservice
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'event-search-service',
        brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
      },
      consumer: {
        groupId: 'event-search-consumer',
        allowAutoTopicCreation: true,
      },
      subscribe: {
        fromBeginning: true,
      },
    },
  });

  // Enable CORS (useful for API gateway or client calls)
  app.enableCors();

  // Start microservices (Kafka consumer)
  await app.startAllMicroservices();

  // Start HTTP server (APIs for search/autocomplete)
  const port = process.env.PORT || 3007;
  await app.listen(port);
  console.log(`Event Search Service is running on HTTP port ${port} and listening to Kafka broker`);
}
bootstrap();
