import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

// TODO: переделать тип под union и рассмотреть нужен ли area если position лежит в target
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
  | { kind: 'target'; victimRef: IEntityRef }
  | { kind: 'aoe'; x: number; y: number };
