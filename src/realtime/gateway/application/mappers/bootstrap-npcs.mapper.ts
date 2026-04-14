import type { INpc } from 'src/modules/npc';
import type { NpcSessionProps } from 'src/realtime/npc-session';

export class BootstrapNpcsMapper {
  public static toProps = (npc: INpc): NpcSessionProps => {
    return {
      spawnId: npc.spawnId,
      position: {
        x: npc.x,
        y: npc.y,
        locationId: npc.locationId,
      },
      name: npc.name,
      level: npc.level,
      id: npc.id,
      faction: 'CrimsonCoven',
      equipmentId: npc.equipmentId,
      combat: {
        currentTargetId: null,
        lastMoveAt: 0,
        lastAttackAt: 0,
        isAlive: npc.isAlive,
        hp: npc.hp,
      },
      appearance: npc.appearance,
      baseStats: {
        maxHp: npc.maxHp,
        walkSpeed: npc.walkSpeed,
        chaseSpeed: npc.chaseSpeed,
        physicalDefense: npc.physicalDefense,
        magicDefense: npc.magicDefense,
        basePhysicalDamage: npc.basePhysicalDamage,
        baseMagicDamage: npc.baseMagicDamage,
        attackSpeed: npc.attackSpeed,
        attackRange: npc.attackRange,
      },
    };
  };
}
