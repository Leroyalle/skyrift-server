import { CharacterSkill } from 'src/characters/character/character-skill/entities/character-skill.entity';
import { ActionType, PendingAction } from 'src/game/types/pending-actions.type';

import { actionRules } from '../../services/action-queue/constants/action-rules.constants';

export const pushTargetAction = (
  queue: PendingAction[],
  hasAutoAttack: boolean,
  pendingAction: PendingAction,
  characterSkill?: CharacterSkill,
) => {
  if (hasAutoAttack) {
    queue.splice(-1, 0, pendingAction);
    return;
  }
  const chainAuto = characterSkill ? actionRules[characterSkill.skill.type].chainAutoAttack : false;

  if (chainAuto) {
    queue.push(pendingAction, {
      ...pendingAction,
      actionType: ActionType.AutoAttack,
      skillId: null,
    });
  } else {
    queue.push(pendingAction);
  }
};
