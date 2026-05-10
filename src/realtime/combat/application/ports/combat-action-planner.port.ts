import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import type { CombatTarget } from '../../domain/types/action-queue.type';

export interface CombatActionPlannerPayload {
  attackerRef: IEntityRef;
  target: CombatTarget;
  skillId: string | null;
}

export interface CombatActionPlannerPort {
  execute(payload: CombatActionPlannerPayload): Promise<void>;
}
