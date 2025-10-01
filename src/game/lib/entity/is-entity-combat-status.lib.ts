import {
  CombatStatus,
  combatStatuses,
} from '../../constants/combat-statuses.constants';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';

export const isEntityCombatStatus = (
  status: TRuntimeEntity['state'],
): status is CombatStatus => {
  return (combatStatuses as readonly string[]).includes(status);
};
