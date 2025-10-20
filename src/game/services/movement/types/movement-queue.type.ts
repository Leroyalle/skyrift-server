import { PositionDto } from 'src/common/dto/position.dto';

export type MobMovementQueue = {
  steps: PositionDto[];
};

export type CharacterMovementQueue = MobMovementQueue & {
  userId: string;
};

export type EntityMovementQueue = CharacterMovementQueue | MobMovementQueue;
