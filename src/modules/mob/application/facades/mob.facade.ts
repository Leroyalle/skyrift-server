import { randomUUID } from 'node:crypto';
import { Appearance } from 'src/common/domain/vo/appearance.vo';

import { Inject, Injectable } from '@nestjs/common';

import { Mob } from '../../domain/entities/mob.entity';
import type { MobPersistenceRepositoryPort } from '../../domain/ports/mob-persistence-repository.port';
import { IMob } from '../../domain/types/mob.type';
import { MobClientMapper } from '../mappers/mob-client.mapper';
import { MobFacadePort } from '../ports/mob-facade.port';
import { MOB_PERSISTENCE_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class MobFacade implements MobFacadePort {
  constructor(
    @Inject(MOB_PERSISTENCE_REPOSITORY_TOKEN)
    private readonly repository: MobPersistenceRepositoryPort,
  ) {}

  public async create(payload: Omit<IMob, 'id'>) {
    const mob = Mob.create({
      id: randomUUID(),
      ...payload,
      appearance: Appearance.create(payload.appearance),
    });

    const domain = await this.repository.save(mob);
    return MobClientMapper.toClient(domain);
  }

  public async update(id: string, payload: Partial<Omit<IMob, 'id'>>): Promise<void> {
    const foundMob = await this.repository.findById(id);
    if (!foundMob) throw new Error('Mob not found');

    const snapshot = foundMob.snapshot();

    const update = Mob.create({
      appearance: Appearance.create(payload.appearance ?? snapshot.appearance),
      attackRange: payload.attackRange ?? snapshot.attackRange,
      attackSpeed: payload.attackSpeed ?? snapshot.attackSpeed,
      baseMagicDamage: payload.baseMagicDamage ?? snapshot.baseMagicDamage,
      basePhysicalDamage: payload.basePhysicalDamage ?? snapshot.basePhysicalDamage,
      chaseSpeed: payload.chaseSpeed ?? snapshot.chaseSpeed,
      critMultiplier: payload.critMultiplier ?? snapshot.critMultiplier,
      equipmentId: payload.equipmentId ?? snapshot.equipmentId,
      hp: payload.hp ?? snapshot.hp,
      isAlive: payload.isAlive ?? snapshot.isAlive,
      id: snapshot.id,
      level: payload.level ?? snapshot.level,
      locationId: payload.locationId ?? snapshot.locationId,
      magicDefense: payload.magicDefense ?? snapshot.magicDefense,
      maxHp: payload.maxHp ?? snapshot.maxHp,
      name: payload.name ?? snapshot.name,
      physicalDefense: payload.physicalDefense ?? snapshot.physicalDefense,
      spawnId: payload.spawnId ?? snapshot.spawnId,
      walkSpeed: payload.walkSpeed ?? snapshot.walkSpeed,
      expReward: payload.expReward ?? snapshot.expReward,
      respawnTime: payload.respawnTime ?? snapshot.respawnTime,
      triggerRange: payload.triggerRange ?? snapshot.triggerRange,
      x: payload.x ?? snapshot.x,
      y: payload.y ?? snapshot.y,
    });

    await this.repository.update(update);
  }

  public remove(id: string) {
    return this.repository.remove(id);
  }
}
