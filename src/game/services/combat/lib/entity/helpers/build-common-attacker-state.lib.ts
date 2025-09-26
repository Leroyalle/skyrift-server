import { CommonAttackerState } from '../../../types/common-attacker-state.type';
import { RuntimeEntity } from 'src/game/types/entity/runtime-entity.type';
import { isPlayer } from '../guards/is-player.lib';
import { isMob } from '../guards/is-mob.lib';

export const buildCommonAttackerState = (
  attacker: RuntimeEntity,
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
      currentTarget: attacker.currentTarget,
      attackRange: attacker.attackRange,
    };
    return commonAttackerState;
  }
};
