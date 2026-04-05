import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

export interface CombatActionPlannerPayload {
  attackerRef: IEntityRef;
  target: Target;
  skillId: string | null;
}
type Target =
  | {
      kind: 'target';
      victimRef: IEntityRef;
    }
  | {
      kind: 'aoe';
      x: number;
      y: number;
    };

export interface CombatActionPlannerPort {
  execute(payload: CombatActionPlannerPayload): Promise<void>;
}
