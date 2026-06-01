import { Module } from '@nestjs/common';
import { TicketCategoriesService } from './ticket-categories.service';
import { TicketCategoriesController } from './ticket-categories.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TicketCategoriesController],
  providers: [TicketCategoriesService],
  exports: [TicketCategoriesService],
})
export class TicketCategoriesModule {}
