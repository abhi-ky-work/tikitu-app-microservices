import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { Public } from '@tikitu/common';
import { PrismaService } from '../prisma/prisma.service';

@Public()
@Controller('v1')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async health() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        service: 'partner',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: 'connected',
      };
    } catch (error) {
      throw new ServiceUnavailableException({
        status: 'unhealthy',
        service: 'partner',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
