import type { IEntityRef, IEntityType } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

export type PendingAction = {
  attackerRef: IEntityRef;
  target: TargetAction;
  area?: IPositionTile;
  actionType: ActionType;
  state: State;
  skillId: string | null;
};

export type ActionType = 'autoAttack' | 'skill' | 'effect';

export type State = 'wait-path' | 'move-to-target' | 'attack';

export type TargetAction =
  | { kind: 'target'; id: string; type: IEntityType }
  | { kind: 'aoe'; x: number; y: number };
