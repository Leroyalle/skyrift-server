import type { RuntimeItem } from '../../domain/types/runtime-item.type';

export interface BagContainerFacadePort {
  getBagItem(containerId: string, itemId: string): RuntimeItem | null;
  addItemToBag(containerId: string, item: RuntimeItem): void;
  removeItemFromBag(containerId: string, itemId: string): RuntimeItem;
  // getEquippedItem(containerId: string, slot: EquipmentSlot): RuntimeItemSnapshot | null;
  // equipFromBag(input: {
  //   bagContainerId: string;
  //   equipmentContainerId: string;
  //   itemId: string;
  //   slot: EquipmentSlot;
  // }): {
  //   equippedItemId: string;
  //   unequippedItemId: string | null;
  // };
}
