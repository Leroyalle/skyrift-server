import type { NpcSession } from '../entities/npc.entity';

export interface NpcSessionRepositoryPort {
  findById(id: string): NpcSession | null;
  getByLocationId(locationId: string): NpcSession[];
  save(npc: NpcSession): void;
  remove(id: string): void;
  update(npc: NpcSession): void;
}
