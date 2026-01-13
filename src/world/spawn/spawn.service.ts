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
    const mobs: Mob[] = [];
    const npcs: Npc[] = [];
    for (const entity of spawn.entities) {
      if (entity instanceof Mob) {
        mobs.push(entity);
        continue;
      }

      if (entity instanceof Npc) {
        npcs.push(entity);
        continue;
      }
    }

    if (mobs.length) {
      const mobSpawnEntity = this.mobSpawnRepository.create({
        ...spawn,
        entities: mobs,
      });

      await this.mobSpawnRepository.save(mobSpawnEntity);
    }

    if (npcs.length) {
      const npcSpawnEntity = this.npcSpawnRepository.create({
        ...spawn,
        entities: npcs,
      });
      await this.npcSpawnRepository.save(npcSpawnEntity);
    }
  }
}
