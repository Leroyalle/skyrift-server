import { CurrentTarget } from 'src/character/types/live-character-state.type';
import { WorldEntity } from 'src/game/types/entity/world-entity.type';
import { isPlayer } from '../../guards/is-player.lib';
import { isMob } from '../../guards/is-mob.lib';

export function setCurrentTarget(
  attacker: WorldEntity,
  target: CurrentTarget | null,
) {
  if (isPlayer(attacker)) {
    attacker.currentTarget = target;
  }
  if (isMob(attacker)) {
    attacker.mob.currentTarget = target;
  }

  return attacker;
}
