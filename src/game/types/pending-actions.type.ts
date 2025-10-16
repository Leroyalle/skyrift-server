import { PositionDto } from 'src/common/dto/position.dto';
import { TargetAction } from '../services/combat/types/target-action.type';
import { EntityRef } from './entity/entity-ref.type';

export type PendingAction = {
  attackerRef: EntityRef;
  target: TargetAction;
  area?: PositionDto;
  actionType: ActionType;
  state: State;
  skillId: string | null;
  // attackInitiation: IAttackInitiation | null;
};

export enum ActionType {
  AutoAttack = 'autoAttack',
  Skill = 'skill',
  Effect = 'effect',
}

export type State = 'wait-path' | 'move-to-target' | 'attack';
