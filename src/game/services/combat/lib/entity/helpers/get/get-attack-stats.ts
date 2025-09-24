import { WorldEntity } from 'src/game/types/entity/world-entity.type';
import { isMob } from '../../guards/is-mob.lib';
import { isPlayer } from '../../guards/is-player.lib';

type AttackStats = {
  lastAttackAt: number;
  attackRange: number;
  attackSpeed: number;
};

export function getAttackStats(attacker: WorldEntity): AttackStats | undefined {
  if (isPlayer(attacker)) {
    return {
      lastAttackAt: attacker.lastAttackAt,
      attackRange: attacker.attackRange,
      attackSpeed: attacker.attackSpeed,
    };
  }
  if (isMob(attacker)) {
    return {
      lastAttackAt: attacker.mob.lastAttackAt,
      attackRange: attacker.mob.attackRange,
      attackSpeed: attacker.mob.attackSpeed,
    };
  }

  return;
}
