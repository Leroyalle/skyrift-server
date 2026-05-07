import { Inject, Injectable } from '@nestjs/common';

import { AccessTokenServicePort } from '../ports/access-token-service.port';
import { AuthFacadePort } from '../ports/auth-facade.port';
import { ACCESS_TOKEN_SERVICE_TOKEN } from '../ports/tokens';

@Injectable()
export class AuthFacade implements AuthFacadePort {
  constructor(
    @Inject(ACCESS_TOKEN_SERVICE_TOKEN) private readonly accessTokenService: AccessTokenServicePort,
  ) {}

  public async verifyAccessToken(token: string) {
    const payload = await this.accessTokenService.verify(token);
    return payload;
  }
}
