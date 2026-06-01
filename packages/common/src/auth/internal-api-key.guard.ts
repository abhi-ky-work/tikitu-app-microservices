import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Validates service-to-service calls using INTERNAL_API_KEY header.
 */
@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const expected = process.env.INTERNAL_API_KEY;

    if (!expected) {
      throw new UnauthorizedException('Internal API key not configured');
    }

    const provided = request.headers['x-internal-api-key'];
    if (provided !== expected) {
      throw new UnauthorizedException('Invalid internal API key');
    }

    return true;
  }
}
