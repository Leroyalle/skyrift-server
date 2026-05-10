import { User } from 'src/modules/user/domain/entities/user.entity';
import { UserRepositoryPort } from 'src/modules/user/domain/ports/user-repository.port';
import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { UserOrmEntity } from '../entities/user-orm.entity';

@Injectable()
export class UserRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly userRepository: Repository<UserOrmEntity>,
  ) {}

  public async create(domain: User) {
    const snapshot = domain.snapshot();
    const result = await this.userRepository.save(snapshot);

    return User.create(result);
  }

  public async findAll() {
    const result = await this.userRepository.find();
    return result.map(item => User.create(item));
  }

  public async findOne(id: string) {
    const result = await this.userRepository.findOneBy({
      id,
    });
    return result ? User.create(result) : null;
  }

  public async findByEmail(email: string) {
    const result = await this.userRepository.findOne({ where: { email } });
    return result ? User.create(result) : null;
  }

  public async update(domain: User) {
    const snapshot = domain.snapshot();
    await this.userRepository.update(snapshot.id, snapshot);
  }
}
