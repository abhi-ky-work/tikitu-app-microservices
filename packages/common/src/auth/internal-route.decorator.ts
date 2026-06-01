import { SetMetadata } from '@nestjs/common';

export const IS_INTERNAL_KEY = 'isInternal';

/** Marks route as internal (service-to-service); skips Cognito, uses API key guard. */
export const InternalRoute = () => SetMetadata(IS_INTERNAL_KEY, true);
