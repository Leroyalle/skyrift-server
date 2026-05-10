import { CLOCK_TOKEN, ClockPort } from 'src/realtime/shared/infrastructure/time';

import { Inject, Injectable } from '@nestjs/common';

import { User } from '../../domain/entities/user.entity';
import { UserRepositoryPort } from '../../domain/ports/user-repository.port';
import { IUser } from '../../domain/types/user.type';
import { USER_REPOSITORY_TOKEN } from '../ports/tokens';
import { UserFacadePort } from '../ports/user-facade.port';

@Injectable()
export class UserFacade implements UserFacadePort {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private readonly repository: UserRepositoryPort,
    @Inject(CLOCK_TOKEN) private readonly clockService: ClockPort,
  ) {}

  public async create(data: Pick<IUser, 'email' | 'password' | 'name'>) {
    const user = User.create({
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      password: data.password,
      refreshToken: null,
      createdAt: this.clockService.now(),
      updatedAt: this.clockService.now(),
    });

    const result = await this.repository.create(user);

    return result.snapshot();
  }

  public async findAll() {
    const users = await this.repository.findAll();
    return users.map(user => user.snapshot());
  }

  public async findOne(id: string) {
    const user = await this.repository.findOne(id);
    return user ? user.snapshot() : null;
  }

  public async findByEmail(email: string) {
    const user = await this.repository.findByEmail(email);
    return user ? user.snapshot() : null;
  }

  public async update(id: string, payload: Partial<IUser>) {
    const foundUser = await this.repository.findOne(id);

    if (!foundUser) {
      throw new Error('User not found');
    }

    const user = User.create(Object.assign(foundUser.snapshot(), payload));

    await this.repository.update(user);
  }
}
