import { USER_FACADE_TOKEN, UserFacadePort } from 'src/modules/user';

import { Inject, Injectable } from '@nestjs/common';

import { AccessTokenServicePort } from '../ports/access-token-service.port';
import { RefreshTokenServicePort } from '../ports/refresh-token.port';
import { ACCESS_TOKEN_SERVICE_TOKEN, REFRESH_TOKEN_SERVICE_TOKEN } from '../ports/tokens';

@Injectable()
export class AuthSessionCreator {
  constructor(
    @Inject(ACCESS_TOKEN_SERVICE_TOKEN)
    private readonly accessTokenService: AccessTokenServicePort,
    @Inject(REFRESH_TOKEN_SERVICE_TOKEN)
    private readonly refreshTokenService: RefreshTokenServicePort,
    @Inject(USER_FACADE_TOKEN)
    private readonly userFacade: UserFacadePort,
  ) {}

  public async execute(user: { id: string; email: string }) {
    const accessToken = await this.accessTokenService.sign(user);

    const refreshToken = await this.refreshTokenService.generateAndHash();

    await this.userFacade.update(user.id, {
      refreshToken: refreshToken.token,
    });

    return { accessToken, refreshToken };
  }
}
