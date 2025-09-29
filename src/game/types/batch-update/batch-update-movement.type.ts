import { TDirection } from '../entity/direction.type';
import { EntityRef } from '../entity/entity-ref.type';

export interface BatchUpdateMovement extends EntityRef {
  locationId: string;
  x: number;
  y: number;
  direction: TDirection;
}
