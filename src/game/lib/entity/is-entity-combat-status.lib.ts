import {
  CombatStatus,
  combatStatuses,
} from '../../constants/combat-statuses.constants';
import { RuntimeEntity } from 'src/game/types/entity/runtime-entity.type';

export const isEntityCombatStatus = (
  status: RuntimeEntity['state'],
): status is CombatStatus => {
  return (combatStatuses as readonly string[]).includes(status);
};
