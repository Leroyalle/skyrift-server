import type { RuntimeItem } from 'src/realtime/container';

export interface ManageBagPort {
  add(payload: ItemAddPayload): void;
  remove(payload: ItemRemovePayload): void;
}

export interface ItemAddPayload {
  containerId: string;
  item: RuntimeItem;
}

export interface ItemRemovePayload {
  containerId: string;
  itemId: string;
}
