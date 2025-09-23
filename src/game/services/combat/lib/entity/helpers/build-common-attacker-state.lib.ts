import { CommonAttackerState } from '../../../types/common-attacker-state.type';
import { WorldEntity } from 'src/game/types/entity/world-entity.type';
import { isPlayer } from '../guards/is-player.lib';
import { isMob } from '../guards/is-mob.lib';

export const buildCommonAttackerState = (
  attacker: WorldEntity,
): CommonAttackerState | undefined => {
  let commonAttackerState: CommonAttackerState;

  const baseStates = {
    id: attacker.id,
    x: attacker.x,
    y: attacker.y,
    locationId: attacker.locationId,
    type: attacker.type,
  };

  if (isPlayer(attacker)) {
    commonAttackerState = {
      ...baseStates,
      characterSkills: attacker.characterSkills,
      currentTarget: attacker.currentTarget,
      attackRange: attacker.attackRange,
    };
    return commonAttackerState;
  }

  if (isMob(attacker)) {
    commonAttackerState = {
      ...baseStates,
      characterSkills: null,
      currentTarget: attacker.mob.currentTarget,
      attackRange: attacker.mob.attackRange,
    };
    return commonAttackerState;
  }
};
