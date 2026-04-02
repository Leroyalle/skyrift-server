import { PositionDto } from 'src/common/dto/position.dto';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import type { TDirection } from './direction.type';

export interface BatchUpdateMovement extends IEntityRef {
  locationId: string;
  from: PositionDto;
  to: PositionDto;
  isFinalStep: boolean;
  lastMoveAt: number;
  moveDuration: number;
  direction: TDirection;
}
