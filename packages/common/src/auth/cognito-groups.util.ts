import { AuthUser } from './auth-user.interface';

export type CognitoGroup = 'admin' | 'partner' | 'user';

export function getCognitoGroups(user: AuthUser): string[] {
  const groups = user['cognito:groups'];
  if (!groups) return [];
  return Array.isArray(groups) ? groups : [groups];
}

export function isAdmin(user: AuthUser): boolean {
  return getCognitoGroups(user).includes('admin');
}

export function isPartner(user: AuthUser): boolean {
  return getCognitoGroups(user).includes('partner');
}

export function isUser(user: AuthUser): boolean {
  return getCognitoGroups(user).includes('user');
}

export function hasGroup(user: AuthUser, group: CognitoGroup): boolean {
  return getCognitoGroups(user).includes(group);
}
