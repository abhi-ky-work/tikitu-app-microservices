import { Module } from '@nestjs/common';
import { DeprecatedEventsController } from './deprecated-events.controller';

@Module({
  controllers: [DeprecatedEventsController],
})
export class DeprecatedEventsModule {}
