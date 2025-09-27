import { TDirection } from '../entity/direction.type';
import { EntityType } from '../entity/entity-type.type';

export type BatchUpdateMovement = {
  id: string;
  type: EntityType;
  locationId: string;
  x: number;
  y: number;
  direction: TDirection;
};
