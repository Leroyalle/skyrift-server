import { INpc } from '../../domain/types/npc.type';

export interface NpcFacadePort {
  create(payload: Omit<INpc, 'id' | 'createdAt' | 'updatedAt'>): Promise<INpc>;
  remove(id: string): Promise<void>;
  update(id: string, payload: Omit<INpc, 'id'>): Promise<void>;
}
