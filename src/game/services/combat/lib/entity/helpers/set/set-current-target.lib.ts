import { CurrentTarget } from 'src/character/types/runtime-character';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';
import { isPlayer } from '../../guards/is-player.lib';
import { isMob } from '../../guards/is-mob.lib';

export function setCurrentTarget(
  attacker: TRuntimeEntity,
  target: CurrentTarget | null,
) {
  if (isPlayer(attacker)) {
    attacker.currentTarget = target;
  }
  if (isMob(attacker)) {
    attacker.currentTarget = target;
  }

  return attacker;
}
