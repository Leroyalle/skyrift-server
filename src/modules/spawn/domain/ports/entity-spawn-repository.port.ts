import type { IEntitySpawn } from '../types/entity-spawn.type';

export interface EntitySpawnRepositoryPort {
  save(spawn: IEntitySpawn): Promise<void>;
  delete(id: IEntitySpawn['id']): Promise<void>;
  getAll(): Promise<IEntitySpawn[]>;
  get(id: IEntitySpawn['id']): Promise<IEntitySpawn | null>;
}
