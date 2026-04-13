import type { IEquipment } from '../../domain/types/equipment.type';

export interface EquipmentFacadePort {
  save(equipment: IEquipment): Promise<void>;
  delete(equipment: IEquipment): Promise<void>;
  update(equipment: IEquipment): Promise<void>;
  findById(id: IEquipment['id']): Promise<IEquipment | null>;
  findByCharacterId(characterId: IEquipment['characterId']): Promise<IEquipment | null>;
}
