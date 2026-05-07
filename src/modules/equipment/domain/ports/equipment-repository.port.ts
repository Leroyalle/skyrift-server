import type { IEquipment } from '../types/equipment.type';

export interface EquipmentRepositoryPort {
  save(equipment: IEquipment): Promise<IEquipment>;
  delete(id: IEquipment['id']): Promise<void>;
  update(equipment: IEquipment): Promise<void>;
  findById(id: IEquipment['id']): Promise<IEquipment | null>;
  findByOwnerRef(ownerRef: IEquipment['ownerRef']): Promise<IEquipment | null>;
}
