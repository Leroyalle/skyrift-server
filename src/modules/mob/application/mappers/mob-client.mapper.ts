import { Mob } from '../../domain/entities/mob.entity';
import { IMob } from '../../domain/types/mob.type';

export class MobClientMapper {
  public static toClient(mob: Mob): IMob {
    const snapshot = mob.snapshot();
    return {
      appearance: snapshot.appearance,
      attackRange: snapshot.attackRange,
      attackSpeed: snapshot.attackSpeed,
      baseMagicDamage: snapshot.baseMagicDamage,
      basePhysicalDamage: snapshot.basePhysicalDamage,
      chaseSpeed: snapshot.chaseSpeed,
      critMultiplier: snapshot.critMultiplier,
      equipmentId: snapshot.equipmentId,
      expReward: snapshot.expReward,
      id: snapshot.id,
      isAlive: snapshot.isAlive,
      level: snapshot.level,
      maxHp: snapshot.maxHp,
      magicDefense: snapshot.magicDefense,
      name: snapshot.name,
      physicalDefense: snapshot.physicalDefense,
      respawnTime: snapshot.respawnTime,
      spawnId: snapshot.spawnId,
      triggerRange: snapshot.triggerRange,
      walkSpeed: snapshot.walkSpeed,
      x: snapshot.x,
      y: snapshot.y,
      locationId: snapshot.locationId,
      hp: snapshot.hp,
    };
  }
}
