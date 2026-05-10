import { USER_FACADE_TOKEN, UserFacadePort } from 'src/modules/user';

import { ForbiddenException, Inject, Injectable } from '@nestjs/common';

import { RefreshHasherPort } from '../ports/refresh-hasher.port';
import { RefreshPort } from '../ports/refresh.port';
import { REFRESH_HASHER_TOKEN } from '../ports/tokens';
import { AuthSessionCreator } from '../services/auth-session-creator.service';

@Injectable()
export class RefreshUseCase implements RefreshPort {
  constructor(
    private readonly authSessionCreator: AuthSessionCreator,
    @Inject(USER_FACADE_TOKEN) private readonly userFacade: UserFacadePort,
    @Inject(REFRESH_HASHER_TOKEN) private readonly refreshHasher: RefreshHasherPort,
  ) {}

  public async execute(userId: string, refreshToken: string) {
    const findUser = await this.userFacade.findOne(userId);

    if (!findUser || !findUser.refreshToken) {
      throw new ForbiddenException('Доступ запрещен');
    }

    const refreshTokenMatches = await this.refreshHasher.verify(
      findUser.refreshToken,
      refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new ForbiddenException('Доступ запрещен');
    }

    return await this.authSessionCreator.execute({
      id: findUser.id,
      email: findUser.email,
    });
  }
}
