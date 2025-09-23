import { WorldEntity } from 'src/game/types/entity/world-entity.type';
import { isMob } from '../guards/is-mob.lib';
import { isPlayer } from '../guards/is-player.lib';

export function getAttackerRange(attacker: WorldEntity): number {
  if (isPlayer(attacker)) {
    return attacker.attackRange;
  }
  if (isMob(attacker)) {
    return attacker.mob.attackRange;
  }

  return 0;
}
