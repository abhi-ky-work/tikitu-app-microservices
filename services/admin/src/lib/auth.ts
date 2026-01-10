import { CognitoJwtVerifier } from 'aws-jwt-verify';
import { NextRequest } from 'next/server';

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.AWS_COGNITO_USER_POOL_ID || '',
  tokenUse: 'access',
  clientId: process.env.AWS_COGNITO_CLIENT_ID || '',
});

export interface AuthUser {
  sub: string;
  email?: string;
  username?: string;
  'cognito:groups'?: string[];
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const payload = await verifier.verify(token);
    return payload as AuthUser;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function authenticateRequest(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}

export function isAdmin(user: AuthUser): boolean {
  return user['cognito:groups']?.includes('admin') || false;
}

