import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AuthenticatedRequest } from '@tikitu/common';

const WINDOW_MS = 60_000;
const MAX_REQUESTS = parseInt(process.env.BOOKING_RATE_LIMIT_PER_MINUTE || '30', 10);

interface WindowEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store = new Map<string, WindowEntry>();

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.sub || request.ip || 'anonymous';
    const key = `booking:${userId}`;
    const now = Date.now();

    let entry = this.store.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + WINDOW_MS };
      this.store.set(key, entry);
    }

    entry.count += 1;
    if (entry.count > MAX_REQUESTS) {
      throw new HttpException(
        'Too many booking requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
