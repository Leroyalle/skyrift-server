import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Mob } from './entities/mob.entity';

@Injectable()
export class MobService {
  constructor(@InjectRepository(Mob) private readonly mobRepository: Repository<Mob>) {}

  public async create(createMobInput: Omit<Mob, 'id'>) {
    return await this.mobRepository.save(createMobInput);
  }
}
