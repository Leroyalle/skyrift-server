import type { IEntityType } from 'src/realtime/shared/types/entity-ref.type';

import type { RuntimeContainerType, RuntimeItem } from './runtime-item.type';

export interface IBagContainer {
  id: string;
  ownerId: string;
  ownerType: IEntityType;
  type: RuntimeContainerType;
  capacity: number | null;
  currentSlots: number;
  items: RuntimeItem[];
}
