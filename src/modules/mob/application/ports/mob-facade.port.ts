import { IMob } from '../../domain/types/mob.type';

export interface MobFacadePort {
  create(payload: Omit<IMob, 'id'>): Promise<IMob>;
  remove(id: string): Promise<void>;
  update(id: string, payload: Omit<IMob, 'id'>): Promise<void>;
}
