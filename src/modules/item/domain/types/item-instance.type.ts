import type { IEntityType } from 'src/realtime/shared/types/entity-ref.type';

export interface ItemInstance {
  id: string;
  templateId: string;

  ownerId: string;
  ownerType: IEntityType;

  containerId: string;
  containerType: ItemContainerType;

  quantity: number;
  durability: number;
}

export type ItemContainerType = 'bag' | 'equipment';
