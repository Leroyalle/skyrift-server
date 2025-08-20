import { PositionDto } from 'src/common/dto/position.dto';

export type MovementQueue = {
  steps: PositionDto[];
  userId: string;
};
