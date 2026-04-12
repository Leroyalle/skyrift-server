import type { IEntityType } from 'src/realtime/shared/types/entity-ref.type';

export interface ItemInstance {
  id: string;
  templateId: string;

  ownerId: string;
  ownerType: IEntityType;

  containerId: string;
  containerType: 'bag' | 'equipment';

  quantity: number;
  durability: number;
}
