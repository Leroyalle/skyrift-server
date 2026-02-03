import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';

import { isMob } from '../../../../../../lib/guards/is-mob.lib';
import { isPlayer } from '../../../../../../lib/guards/is-player.lib';

export function getAttackerRange(attacker: TRuntimeEntity): number {
  if (isPlayer(attacker)) {
    return attacker.attackRange;
  }
  if (isMob(attacker)) {
    return attacker.attackRange;
  }

  return 0;
}
