import { USER_FACADE_TOKEN, UserFacadePort } from 'src/modules/user';

import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { PasswordHasherPort } from '../ports/password-hasher.port';
import { SignInPayload, SignInPort, SignInResult } from '../ports/sign-in.port';
import { PASSWORD_HASHER_TOKEN } from '../ports/tokens';
import { AuthSessionCreator } from '../services/auth-session-creator.service';

@Injectable()
export class SignInUseCase implements SignInPort {
  constructor(
    @Inject(USER_FACADE_TOKEN) private readonly userFacade: UserFacadePort,
    private readonly authSessionCreator: AuthSessionCreator,
    @Inject(PASSWORD_HASHER_TOKEN) private readonly hasher: PasswordHasherPort,
  ) {}

  public async execute(payload: SignInPayload): Promise<SignInResult> {
    const foundUser = await this.userFacade.findByEmail(payload.email);
    if (!foundUser) {
      throw new NotFoundException('Пользователь не найден');
    }

    const verifyResult = await this.hasher.verify(foundUser.password, payload.password);

    if (!verifyResult) {
      throw new BadRequestException('Неверный логин или пароль');
    }

    return await this.authSessionCreator.execute({
      email: foundUser.email,
      id: foundUser.id,
    });
  }
}
