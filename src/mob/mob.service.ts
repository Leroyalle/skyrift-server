import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Mob } from './entities/mob.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MobService {
  constructor(@InjectRepository(Mob) private readonly mobRepository: Repository<Mob>) {}

  async create(createMobInput: Omit<Mob, 'id'>) {
    return await this.mobRepository.save(createMobInput);
  }
}
