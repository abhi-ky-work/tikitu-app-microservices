import { SetMetadata } from '@nestjs/common';
import { CognitoGroup } from './cognito-groups.util';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: CognitoGroup[]) => SetMetadata(ROLES_KEY, roles);
