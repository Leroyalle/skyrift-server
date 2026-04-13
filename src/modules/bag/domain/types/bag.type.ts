import type { IEntityType } from 'src/realtime/shared/types/entity-ref.type';

export interface IBag {
  id: string;
  ownerId: string;
  ownerType: IEntityType;
  maxSlots: number;
  currentSlots: number;
}
