export interface ItemInstance {
  id: string;
  templateId: string;

  containerId: string;
  containerType: ItemContainerType;

  quantity: number;
  durability: number;
}

export type ItemContainerType = 'bag' | 'equipment';
