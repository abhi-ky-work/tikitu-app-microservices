import { Injectable } from '@nestjs/common';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { AuthUser } from './auth-user.interface';

@Injectable()
export class CognitoService {
  private readonly verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.AWS_COGNITO_USER_POOL_ID || '',
    tokenUse: 'access',
    clientId: process.env.AWS_COGNITO_CLIENT_ID || '',
  });

  async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const payload = await this.verifier.verify(token);
      return payload as AuthUser;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  }

  extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7);
  }
}
