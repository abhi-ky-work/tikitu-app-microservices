import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CognitoAuthGuard } from './cognito-auth.guard';
import { CognitoService } from './cognito.service';

@Global()
@Module({
  providers: [
    CognitoService,
    CognitoAuthGuard,
    {
      provide: APP_GUARD,
      useClass: CognitoAuthGuard,
    },
  ],
  exports: [CognitoService, CognitoAuthGuard],
})
export class CognitoAuthModule {}
