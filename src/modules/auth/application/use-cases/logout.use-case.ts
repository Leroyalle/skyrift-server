import { USER_FACADE_TOKEN, UserFacadePort } from 'src/modules/user';

import { Inject, Injectable } from '@nestjs/common';

import { LogoutPort } from '../ports/logout.port';

@Injectable()
export class LogoutUseCase implements LogoutPort {
  constructor(@Inject(USER_FACADE_TOKEN) private readonly userFacade: UserFacadePort) {}

  public async execute(userId: string) {
    return await this.userFacade.update(userId, { refreshToken: null });
  }
}
