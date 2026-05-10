import { Appearance } from 'src/common/domain/vo/appearance.vo';
import { Mob } from 'src/modules/mob/domain/entities/mob.entity';
import type { DeepPartial } from 'typeorm';

import { MobOrmEntity } from '../entities/mob-orm.entity';

export class MobMapper {
  public static toDomain = (raw: MobOrmEntity): Mob => {
    return Mob.create({
      locationId: raw.locationId,
      id: raw.id,
      spawnId: raw.spawnId,
      x: raw.x,
      y: raw.y,
      walkSpeed: raw.walkSpeed,
      triggerRange: raw.triggerRange,
      chaseSpeed: raw.chaseSpeed,
      expReward: raw.expReward,
      respawnTime: raw.respawnTime,
      name: raw.name,
      level: raw.level,
      maxHp: raw.maxHp,
      hp: raw.hp,
      basePhysicalDamage: raw.basePhysicalDamage,
      baseMagicDamage: raw.baseMagicDamage,
      physicalDefense: raw.physicalDefense,
      magicDefense: raw.magicDefense,

      critMultiplier: raw.critMultiplier,
      attackSpeed: raw.attackSpeed,
      attackRange: raw.attackRange,
      isAlive: raw.isAlive,
      appearance: Appearance.create({
        head: raw.appearance.head,
        body: raw.appearance.body,
      }),
      equipmentId: raw.equipmentId,
    });
  };

  public static toPersistence(mob: Mob): DeepPartial<MobOrmEntity> {
    const snapshot = mob.snapshot();
    return {
      x: snapshot.x,
      y: snapshot.y,
      locationId: snapshot.locationId,
      walkSpeed: snapshot.walkSpeed,
      triggerRange: snapshot.triggerRange,
      chaseSpeed: snapshot.chaseSpeed,
      expReward: snapshot.expReward,
      respawnTime: snapshot.respawnTime,
      spawnId: snapshot.spawnId,
      name: snapshot.name,
      level: snapshot.level,
      maxHp: snapshot.maxHp,
      hp: snapshot.hp,
      basePhysicalDamage: snapshot.basePhysicalDamage,
      baseMagicDamage: snapshot.baseMagicDamage,
      physicalDefense: snapshot.physicalDefense,
      magicDefense: snapshot.magicDefense,
      critMultiplier: snapshot.critMultiplier,
      attackSpeed: snapshot.attackSpeed,
      attackRange: snapshot.attackRange,
      isAlive: snapshot.isAlive,
      appearance: snapshot.appearance,
      equipmentId: snapshot.equipmentId,
      id: snapshot.id,
    };
  }
}
