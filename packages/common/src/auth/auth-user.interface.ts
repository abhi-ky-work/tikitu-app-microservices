export interface AuthUser {
  sub: string;
  email?: string;
  username?: string;
  'cognito:groups'?: string[];
}
