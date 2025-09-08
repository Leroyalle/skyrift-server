import { PositionDto } from 'src/common/dto/position.dto';

export enum InteractionType {
  Teleport = 'teleport',
  Talk = 'talk',
}

export type PendingInteraction = {
  characterId: string;
  type: InteractionType;
  targetId?: string;
  area?: PositionDto;
};
