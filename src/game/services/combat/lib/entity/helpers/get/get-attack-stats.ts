import { RuntimeEntity } from 'src/game/types/entity/runtime-entity.type';
import { isMob } from '../../guards/is-mob.lib';
import { isPlayer } from '../../guards/is-player.lib';

type AttackStats = {
  lastAttackAt: number;
  attackRange: number;
  attackSpeed: number;
};

export function getAttackStats(
  attacker: RuntimeEntity,
): AttackStats | undefined {
  if (isPlayer(attacker)) {
    return {
      lastAttackAt: attacker.lastAttackAt,
      attackRange: attacker.attackRange,
      attackSpeed: attacker.attackSpeed,
    };
  }
  if (isMob(attacker)) {
    return {
      lastAttackAt: attacker.lastAttackAt,
      attackRange: attacker.attackRange,
      attackSpeed: attacker.attackSpeed,
    };
  }

  return;
}
