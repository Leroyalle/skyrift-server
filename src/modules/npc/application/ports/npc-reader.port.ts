import type { INpc } from '../../domain/types/npc.type';

export interface NpcReaderPort {
  findById(id: string): Promise<INpc | null>;
  findByLocationId(locationId: string): Promise<INpc[]>;
}
