import type { IMob } from 'src/modules/mob';
import type { MobSessionProps } from 'src/realtime/mob-session';

export class BootstrapMobsMapper {
  public static toProps = (mob: IMob): MobSessionProps => {
    return {
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
        currentTargetId: null,
        lastMoveAt: 0,
        lastAttackAt: 0,
        isAlive: mob.isAlive,
        hp: mob.hp,
      },
      appearance: mob.appearance,
      baseStats: {
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
