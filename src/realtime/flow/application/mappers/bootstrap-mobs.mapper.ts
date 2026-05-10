import type { IMob } from 'src/modules/mob';
import type { IEntitySpawn } from 'src/modules/spawn';
import type { SpawnMobSessionPayload } from 'src/realtime/mob-session';

export class BootstrapMobsMapper {
  public static toProps = (
    mob: IMob & { equipmentId: string },
    spawn: IEntitySpawn,
  ): SpawnMobSessionPayload => {
    return {
      spawn: {
        position: {
          x: spawn.spawnX,
          y: spawn.spawnY,
          locationId: spawn.locationId,
        },
        spawnId: mob.spawnId,
      },
      lifecycle: {
        respawnIn: mob.respawnTime,
        nextThinkAt: 0,
      },
      position: {
        x: mob.x,
        y: mob.y,
        locationId: mob.locationId,
      },
      name: mob.name,
      level: mob.level,
      id: mob.id,
      faction: 'CrimsonCoven',
      equipmentId: mob.equipmentId,
      combat: {
        lastHpRegenerationTime: 0,
        currentTargetRef: null,
        lastMoveAt: 0,
        lastAttackAt: 0,
        isAlive: mob.isAlive,
        hp: mob.hp,
      },
      appearance: mob.appearance,
      baseStats: {
        triggerRange: mob.triggerRange,
        maxHp: mob.maxHp,
        walkSpeed: mob.walkSpeed,
        chaseSpeed: mob.chaseSpeed,
        physicalDefense: mob.physicalDefense,
        magicDefense: mob.magicDefense,
        basePhysicalDamage: mob.basePhysicalDamage,
        baseMagicDamage: mob.baseMagicDamage,
        attackSpeed: mob.attackSpeed,
        attackRange: mob.attackRange,
      },
    };
  };
}
