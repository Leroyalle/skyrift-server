import type { EquipmentContainer } from '../entities/equipment-container.entity';

export interface InMemoryEquipmentContainerRepositoryPort {
  save(data: EquipmentContainer): void;
  findById(id: string): EquipmentContainer | null;
  findAll(): EquipmentContainer[];
  remove(id: string): void;
}
