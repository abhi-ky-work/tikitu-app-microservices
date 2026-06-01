import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthUser } from './auth-user.interface';
import { CognitoService } from './cognito.service';
import { IS_INTERNAL_KEY } from './internal-route.decorator';
import { IS_PUBLIC_KEY } from './public.decorator';

export type AuthenticatedRequest = Request & { user?: AuthUser };

@Injectable()
export class CognitoAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cognitoService: CognitoService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isInternal = this.reflector.getAllAndOverride<boolean>(IS_INTERNAL_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isInternal) {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.cognitoService.extractTokenFromHeader(
      request.headers.authorization,
    );

    if (!token) {
      throw new UnauthorizedException('Invalid or missing authentication token');
    }

    const user = await this.cognitoService.verifyToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid or missing authentication token');
    }

    request.user = user;
    return true;
  }
}
