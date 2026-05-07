import type { IEquipmentContainer } from 'src/realtime/container';

export type EntityWithEquipment<T> = T & {
  equipment: IEquipmentContainer;
};
