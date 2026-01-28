import { EquipmentSlotEnum } from 'src/common/enums/equipment-slot.enum';

import { EntityRef } from '../entity/entity-ref.type';

export type TEquipResult = {
  entityRef: EntityRef;
  changes: Changes[];
};

type Changes = {
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
  slot: EquipmentSlotEnum;
}
interface BagLocation {
  container: 'bag';
}
