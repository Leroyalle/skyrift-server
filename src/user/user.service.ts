import { Injectable } from '@nestjs/common';
import { CreateUserInput } from './dto/create-user.input';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserInput } from './dto/update-user.input';

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
    return await this.userRepository.update(
      updateUserInput.id,
      updateUserInput,
    );
  }
}
