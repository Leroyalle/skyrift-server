import { IEntitySpawn } from '../../domain/types/entity-spawn.type';

export interface SpawnFacadePort {
  create(entitySpawn: Omit<IEntitySpawn, 'id'>): Promise<IEntitySpawn>;
  delete(id: IEntitySpawn['id']): Promise<void>;
}
