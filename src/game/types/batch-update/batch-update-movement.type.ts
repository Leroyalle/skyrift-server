import { PositionDto } from 'src/common/dto/position.dto';
import { TDirection } from '../entity/direction.type';
import { EntityRef } from '../entity/entity-ref.type';

export interface BatchUpdateMovement extends EntityRef {
  locationId: string;
  from: PositionDto;
  to: PositionDto;
  lastMoveAt: number;
  moveDuration: number;
  direction: TDirection;
  // x: number;
  // y: number;
}
