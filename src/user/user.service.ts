import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async create(createUserInput: CreateUserInput) {
    return await this.userRepository.save(createUserInput);
  }

  public async findAll() {
    return await this.userRepository.find();
  }

  public async findOne(id: string) {
    return await this.userRepository.findOne({
      where: { id },
    });
  }

  public async findByEmail(email: string) {
    return await this.userRepository.findOne({ where: { email } });
  }

  public async update(updateUserInput: UpdateUserInput) {
    return await this.userRepository.update(updateUserInput.id, updateUserInput);
  }
}
