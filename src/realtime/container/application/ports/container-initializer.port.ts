import type { IBagContainer } from '../../domain/types/bag-container.type';
import type { IEquipmentContainer } from '../../domain/types/equipment-container.type';

export interface ContainerInitializerPort {
  initializeBag(payload: IBagContainer): IBagContainer;
  initializeEquipment(payload: IEquipmentContainer): IEquipmentContainer;
  clearBag(containerId: string): void;
  clearEquipment(containerId: string): void;
}
