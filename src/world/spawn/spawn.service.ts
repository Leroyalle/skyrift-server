import { Mob } from 'src/characters/mob/entities/mob.entity';
import { Npc } from 'src/characters/npc/entities/npc.entity';
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
    const mobSpawner: Mob[] = [];
    const npcSpawner: Npc[] = [];
    for (const entity of spawn.entities) {
      if (entity instanceof Mob) {
        mobSpawner.push(entity);
        continue;
      }

      if (entity instanceof Npc) {
        npcSpawner.push(entity);
        continue;
      }
    }

    if (mobSpawner.length) {
      const mobSpawnEntity = this.mobSpawnRepository.create({
        ...spawn,
        entities: mobSpawner,
      });

      await this.mobSpawnRepository.save(mobSpawnEntity);
    }

    if (npcSpawner.length) {
      const npcSpawnEntity = this.npcSpawnRepository.create({
        ...spawn,
        entities: npcSpawner,
      });
      await this.npcSpawnRepository.save(npcSpawnEntity);
    }
  }
}
