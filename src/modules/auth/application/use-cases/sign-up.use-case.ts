import { USER_FACADE_TOKEN, UserFacadePort } from 'src/modules/user';

import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { PasswordHasherPort } from '../ports/password-hasher.port';
import { SignUpPayload, SignUpPort, SignUpResult } from '../ports/sign-up.port';
import { PASSWORD_HASHER_TOKEN } from '../ports/tokens';
import { AuthSessionCreator } from '../services/auth-session-creator.service';

@Injectable()
export class SignUpUseCase implements SignUpPort {
  constructor(
    @Inject(PASSWORD_HASHER_TOKEN) private readonly hasher: PasswordHasherPort,
    private readonly authSessionCreator: AuthSessionCreator,
    @Inject(USER_FACADE_TOKEN) private readonly userFacade: UserFacadePort,
  ) {}

  public async execute(payload: SignUpPayload): Promise<SignUpResult> {
    const foundUser = await this.userFacade.findByEmail(payload.email);

    if (foundUser) {
      throw new BadRequestException('Пользователь с таким email уже зарегестрирован');
    }

    const hashedPassword = await this.hasher.hash(payload.password);

    const createdUser = await this.userFacade.create({
      name: payload.name,
      email: payload.email,
      password: hashedPassword,
    });
    return await this.authSessionCreator.execute({
      id: createdUser.id,
      email: createdUser.email,
    });
  }
}
