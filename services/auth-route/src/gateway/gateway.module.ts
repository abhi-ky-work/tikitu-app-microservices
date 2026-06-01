import { Module } from '@nestjs/common';
import { CognitoService } from '@tikitu/common';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

@Module({
  controllers: [GatewayController],
  providers: [GatewayService, CognitoService],
})
export class GatewayModule {}
