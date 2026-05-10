import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

// FIXME: переделать тип под union и рассмотреть нужен ли area если position лежит в target
export type PendingAction = {
  attackerRef: IEntityRef;
  target: CombatTarget;
  area?: IPositionTile;
  actionType: ActionType;
  state: State;
  skillId: string | null;
};

export type ActionType = 'autoAttack' | 'skill' | 'effect';

export type State = 'wait-path' | 'move-to-target' | 'attack';

type TargetKind = 'aoe' | 'target';

type TargetValueByKind = {
  aoe: IPositionTile;
  target: IEntityRef;
};

type Target<K extends TargetKind = TargetKind> = {
  kind: K;
  value: TargetValueByKind[K];
};

export type CombatTarget = {
  [K in TargetKind]: Target<K>;
}[TargetKind];
