import { Injectable } from '@nestjs/common';

import type { EquipmentContainer } from '../../domain/entities/equipment-container.entity';
import type { InMemoryEquipmentContainerRepositoryPort } from '../../domain/ports/in-memory-equipment-container-repository.port';

@Injectable()
export class InMemoryEquipmentContainerRepository implements InMemoryEquipmentContainerRepositoryPort {
  private readonly sessions = new Map<string, EquipmentContainer>();

  public save(data: EquipmentContainer): void {
    this.sessions.set(data.id, data);
  }

  public findById(id: string): EquipmentContainer | null {
    return this.sessions.get(id) ?? null;
  }

  public remove(id: string): void {
    this.sessions.delete(id);
  }

  public findAll(): EquipmentContainer[] {
    return Array.from(this.sessions.values());
  }
}
