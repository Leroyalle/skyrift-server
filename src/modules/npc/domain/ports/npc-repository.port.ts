import type { INpc } from '../types/npc.type';

export interface NpcRepositoryPort {
  findById(id: string): Promise<INpc | null>;
  save(npc: INpc): Promise<void>;
  remove(id: string): Promise<void>;
  update(npc: INpc): Promise<void>;
}
