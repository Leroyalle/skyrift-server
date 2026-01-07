import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { MobSpawn } from './entities/mob-spawn.entity';
import { NpcSpawn } from './entities/npc-spawn.entity';
import { ICreateSpawn } from './types/create-spawn.type';

@Injectable()
export class SpawnService {
  constructor(
    // private readonly mobService: MobService,
    // private readonly NpcService: NpcService,
    @InjectRepository(MobSpawn)
    private readonly mobSpawnRepository: Repository<MobSpawn>,
    @InjectRepository(NpcSpawn)
    private readonly npcSpawnRepository: Repository<NpcSpawn>,
  ) {}

  public async createSpawn(input: ICreateSpawn) {
    switch (input.type) {
      case 'mob': {
        await this.mobSpawnRepository.save(input.entity);
        break;
      }

      case 'npc': {
        await this.npcSpawnRepository.save(input.entity);
        break;
      }

      default:
        break;
    }
  }
}
