import type { IEquipment } from '../../domain/types/equipment.type';

export interface EquipmentFacadePort {
  save(equipment: Omit<IEquipment, 'id'>): Promise<IEquipment>;
  delete(id: IEquipment['id']): Promise<void>;
  update(id: IEquipment['id'], equipment: Omit<IEquipment, 'id'>): Promise<void>;
  findById(id: IEquipment['id']): Promise<IEquipment | null>;
  findByOwnerRef(ownerRef: IEquipment['ownerRef']): Promise<IEquipment | null>;
}
