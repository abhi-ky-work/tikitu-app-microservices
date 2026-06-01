import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { CognitoService } from '@tikitu/common';
import axios, { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import {
  getServiceUrl,
  isPublicRoute,
  parseServicePath,
} from './gateway.constants';

@Injectable()
export class GatewayService {
  constructor(private readonly cognitoService: CognitoService) {}

  getGatewayHealth() {
    return {
      status: 'healthy',
      service: 'auth-route-gateway',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      description: 'API Gateway for Tikitu Microservices',
      services: {
        admin: process.env.ADMIN_SERVICE_URL || 'http://localhost:3001',
        partner: process.env.PARTNER_SERVICE_URL || 'http://localhost:3002',
        payment: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3003',
        notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004',
        booking: process.env.BOOKING_SERVICE_URL || 'http://localhost:3005',
        user: process.env.USER_SERVICE_URL || 'http://localhost:3006',
      },
    };
  }

  async handleProxy(req: Request, res: Response) {
    const pathname = req.originalUrl.split('?')[0];

    const parsed = parseServicePath(pathname);
    if (!parsed) {
      throw new BadRequestException({
        error: 'Invalid request path',
      });
    }

    const { service, path } = parsed;
    const serviceUrl = getServiceUrl(service);

    if (!serviceUrl) {
      throw new ServiceUnavailableException({
        error: 'Service not available',
        message: `The '${service}' service is not enabled`,
      });
    }

    if (!isPublicRoute(pathname)) {
      const token = this.cognitoService.extractTokenFromHeader(req.headers.authorization);
      if (!token) {
        throw new UnauthorizedException({
          error: 'Unauthorized',
          message: 'Invalid or missing authentication token',
        });
      }
      const user = await this.cognitoService.verifyToken(token);
      if (!user) {
        throw new UnauthorizedException({
          error: 'Unauthorized',
          message: 'Invalid or missing authentication token',
        });
      }
    }

    const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
    const targetEndpoint = `${serviceUrl}/api/v1/${path}${query}`;

    try {
      const headers: Record<string, string> = {
        'Content-Type': (req.headers['content-type'] as string) || 'application/json',
      };
      if (req.headers.authorization) {
        headers.Authorization = req.headers.authorization;
      }

      const response: AxiosResponse = await axios({
        method: req.method,
        url: targetEndpoint,
        headers,
        data: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body,
        validateStatus: () => true,
      });

      res
        .status(response.status)
        .set('Content-Type', response.headers['content-type'] || 'application/json');

      if (typeof response.data === 'string') {
        res.send(response.data);
      } else {
        res.json(response.data);
      }
    } catch (error) {
      throw new ServiceUnavailableException({
        error: 'Service unavailable',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
