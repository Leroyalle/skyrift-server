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

  public async createSpawn(spawn: ICreateSpawn): Promise<void> {
    for (const entity of spawn.entities) {
      if (entity instanceof MobSpawn) {
        await this.mobSpawnRepository.save(spawn);
        return;
      }

      if (entity instanceof NpcSpawn) {
        await this.npcSpawnRepository.save(spawn);
        return;
      }
    }
  }
}
