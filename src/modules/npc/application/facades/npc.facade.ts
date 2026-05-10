import { randomUUID } from 'node:crypto';
import { CLOCK_TOKEN, ClockPort } from 'src/realtime/shared/infrastructure/time';

import { Inject, Injectable } from '@nestjs/common';

import { NpcRepositoryPort } from '../../domain/ports/npc-repository.port';
import { INpc } from '../../domain/types/npc.type';
import { NpcFacadePort } from '../ports/npc-facade.port';
import { NPC_PERSISTENCE_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class NpcFacade implements NpcFacadePort {
  constructor(
    @Inject(NPC_PERSISTENCE_REPOSITORY_TOKEN)
    private readonly repository: NpcRepositoryPort,
    @Inject(CLOCK_TOKEN) private readonly clockService: ClockPort,
  ) {}

  public create(payload: Omit<INpc, 'id'>) {
    return this.repository.save({ id: randomUUID(), ...payload });
  }

  public async update(id: string, payload: Partial<Omit<INpc, 'id'>>): Promise<void> {
    const foundNpc = await this.repository.findById(id);
    if (!foundNpc) throw new Error('Mob not found');

    const update: INpc = {
      appearance: payload.appearance ?? foundNpc.appearance,
      attackRange: payload.attackRange ?? foundNpc.attackRange,
      attackSpeed: payload.attackSpeed ?? foundNpc.attackSpeed,
      baseMagicDamage: payload.baseMagicDamage ?? foundNpc.baseMagicDamage,
      basePhysicalDamage: payload.basePhysicalDamage ?? foundNpc.basePhysicalDamage,
      chaseSpeed: payload.chaseSpeed ?? foundNpc.chaseSpeed,
      createdAt: foundNpc.createdAt,
      critMultiplier: payload.critMultiplier ?? foundNpc.critMultiplier,
      equipmentId: payload.equipmentId ?? foundNpc.equipmentId,
      hp: payload.hp ?? foundNpc.hp,
      isAlive: payload.isAlive ?? foundNpc.isAlive,
      id: foundNpc.id,
      level: payload.level ?? foundNpc.level,
      locationId: payload.locationId ?? foundNpc.locationId,
      magicDefense: payload.magicDefense ?? foundNpc.magicDefense,
      maxHp: payload.maxHp ?? foundNpc.maxHp,
      name: payload.name ?? foundNpc.name,
      physicalDefense: payload.physicalDefense ?? foundNpc.physicalDefense,
      spawnId: payload.spawnId ?? foundNpc.spawnId,
      updatedAt: this.clockService.now(),
      walkSpeed: payload.walkSpeed ?? foundNpc.walkSpeed,
      x: payload.x ?? foundNpc.x,
      y: payload.y ?? foundNpc.y,
    };

    await this.repository.update(update);
  }

  public remove(id: string) {
    return this.repository.remove(id);
  }
}
