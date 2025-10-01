import { EntityType } from 'src/game/types/entity/entity-type.type';

export interface EntityRef {
  type: EntityType;
  id: string;
}
