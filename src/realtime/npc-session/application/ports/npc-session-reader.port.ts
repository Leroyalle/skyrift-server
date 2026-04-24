import type { NpcSessionSnapshot } from '../../domain/types/npc-session.type';

export interface NpcSessionReaderPort {
  findById(id: string): NpcSessionSnapshot | null;
  getByLocationId(locationId: string): NpcSessionSnapshot[];
  getIterable(): Iterable<NpcSessionSnapshot>;
}
