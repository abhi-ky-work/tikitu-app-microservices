import { All, Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get('health')
  getHealth() {
    return this.gatewayService.getGatewayHealth();
  }

  @All('v1/*')
  async proxy(@Req() req: Request, @Res() res: Response) {
    await this.gatewayService.handleProxy(req, res);
  }
}
