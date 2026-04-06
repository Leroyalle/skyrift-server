import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

export interface CombatActionPlannerPayload {
  attackerRef: IEntityRef;
  target: CombatTarget;
  skillId: string | null;
}

type TargetKind = 'aoe' | 'target';

type TargetValueByKind = {
  aoe: IPositionTile;
  target: IEntityRef;
};

type Target<K extends TargetKind = TargetKind> = {
  kind: K;
  value: TargetValueByKind[K];
};

type CombatTarget = {
  [K in TargetKind]: Target<K>;
}[TargetKind];

export interface CombatActionPlannerPort {
  execute(payload: CombatActionPlannerPayload): Promise<void>;
}
