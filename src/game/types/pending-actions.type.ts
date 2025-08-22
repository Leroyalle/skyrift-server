import { PositionDto } from 'src/common/dto/position.dto';
import { TargetAction } from '../services/combat/types/target-action.type';

export type PendingAction = {
  attackerId: string;
  victimId?: string;
  target: TargetAction;
  area?: PositionDto;
  actionType: ActionType;
  state: State;
  skillId: string | null;
};

export enum ActionType {
  AutoAttack = 'autoAttack',
  Heal = 'heal',
  Skill = 'skill',
}

export type State = 'wait-path' | 'move-to-target' | 'attack';
