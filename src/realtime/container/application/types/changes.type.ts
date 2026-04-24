import type { EquipmentSlot } from 'src/common/types/equipment-slot.type';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

export type TEquipResult = {
  entityRef: IEntityRef;
  changes: Changes[];
};

export type Changes = {
  [K in keyof LocationMap]: Move<K>;
}[keyof LocationMap];

type Move<K extends keyof LocationMap> = {
  from: LocationMap[K];
  to: LocationMap[Exclude<keyof LocationMap, K>];
  itemId: string;
};

type LocationMap = {
  bag: BagLocation;
  equipment: EquipmentLocation;
};

interface EquipmentLocation {
  container: 'equipment';
  slot: EquipmentSlot;
}
interface BagLocation {
  container: 'bag';
}
