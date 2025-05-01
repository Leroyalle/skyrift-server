import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  public async run() {
    await this.clearListings();

    await this.userRepository.save({
      name: 'Leroyalle',
      email: 'leroyalle@example.com',
      password: 'password',
      refreshToken: null,
    });

    console.log('Listings seeded');
  }

  private async clearListings() {
    await this.userRepository.query('TRUNCATE TABLE "user" CASCADE');
    console.log('Listings cleared');
  }
}
