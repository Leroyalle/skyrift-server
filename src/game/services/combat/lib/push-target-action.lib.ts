import { ActionType, PendingAction } from 'src/game/types/pending-actions.type';
import { actionRules } from '../constants/action-rules.constants';
import { CharacterSkill } from 'src/character/character-skill/entities/character-skill.entity';

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
  const chainAuto = characterSkill
    ? actionRules[characterSkill.skill.type].chainAutoAttack
    : false;

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
