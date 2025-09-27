import { PositionDto } from 'src/common/dto/position.dto';
import { TargetAction } from '../services/combat/types/target-action.type';
import { DecodedEntityKey } from './entity/keys/decoded-entity-key.type';

export type PendingAction = {
  // attackerId: string;
  attackerRef: DecodedEntityKey;
  // victimRef: DecodedEntityKey;
  // victimId?: string;
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
