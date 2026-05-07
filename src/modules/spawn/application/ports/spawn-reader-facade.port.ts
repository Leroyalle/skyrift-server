import type { IEntitySpawn } from '../../domain/types/entity-spawn.type';

export interface SpawnReaderFacadePort {
  getAll(): Promise<IEntitySpawn[]>;
  get(id: IEntitySpawn['id']): Promise<IEntitySpawn | null>;
}
