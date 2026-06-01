import { Module } from '@nestjs/common';
import { InternalApiKeyGuard } from '@tikitu/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, InternalApiKeyGuard],
})
export class NotificationsModule {}
