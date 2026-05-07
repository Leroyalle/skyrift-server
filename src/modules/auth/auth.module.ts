import { UserModule } from 'src/modules/user/user.module';

import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthFacade } from './application/facades/auth.facade';
import {
  ACCESS_TOKEN_SERVICE_TOKEN,
  AUTH_FACADE_TOKEN,
  LOGOUT_USE_CASE_TOKEN,
  PASSWORD_HASHER_TOKEN,
  REFRESH_HASHER_TOKEN,
  REFRESH_TOKEN_SERVICE_TOKEN,
  REFRESH_USE_CASE_TOKEN,
  SIGN_IN_USE_CASE_TOKEN,
  SIGN_UP_USE_CASE_TOKEN,
} from './application/ports/tokens';
import { AuthSessionCreator } from './application/services/auth-session-creator.service';
import { LogoutUseCase } from './application/use-cases/logout.use-case';
import { RefreshUseCase } from './application/use-cases/refresh.use-case';
import { SignInUseCase } from './application/use-cases/sign-in.use-case';
import { SignUpUseCase } from './application/use-cases/sign-up.use-case';
import { ArgonPasswordHasher } from './infrastructure/security/password-hasher.service';
import { AccessTokenService } from './infrastructure/token/access-token.service';
import { RefreshTokenService } from './infrastructure/token/refresh-token.service';
import { RefreshHasher } from './infrastructure/token/services/refresh.hasher';
import { AccessTokenStrategy } from './infrastructure/token/strategies/access-token.strategy';
import { RefreshTokenStrategy } from './infrastructure/token/strategies/refresh-token.strategy';
import { AuthGraphqlController } from './presentation/auth.graphql.controller';

@Global()
@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    JwtModule.register({}),
    UserModule,
  ],

  providers: [
    AuthGraphqlController,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    AuthSessionCreator,
    {
      provide: ACCESS_TOKEN_SERVICE_TOKEN,
      useClass: AccessTokenService,
    },
    {
      provide: REFRESH_TOKEN_SERVICE_TOKEN,
      useClass: RefreshTokenService,
    },
    {
      provide: PASSWORD_HASHER_TOKEN,
      useClass: ArgonPasswordHasher,
    },
    {
      provide: SIGN_IN_USE_CASE_TOKEN,
      useClass: SignInUseCase,
    },
    {
      provide: SIGN_UP_USE_CASE_TOKEN,
      useClass: SignUpUseCase,
    },
    {
      provide: LOGOUT_USE_CASE_TOKEN,
      useClass: LogoutUseCase,
    },
    {
      provide: REFRESH_HASHER_TOKEN,
      useClass: RefreshHasher,
    },
    {
      provide: REFRESH_USE_CASE_TOKEN,
      useClass: RefreshUseCase,
    },
    {
      provide: AUTH_FACADE_TOKEN,
      useClass: AuthFacade,
    },
  ],
  exports: [AUTH_FACADE_TOKEN],
})
export class AuthModule {}
