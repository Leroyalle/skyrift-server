import { Inject } from '@nestjs/common';

import type { EntitySpawnRepositoryPort } from '../../domain/ports/entity-spawn-repository.port';
import type { IEntitySpawn } from '../../domain/types/entity-spawn.type';
import type { SpawnReaderFacadePort } from '../ports/spawn-reader-facade.port';
import { ENTITY_SPAWN_REPOSITORY_TOKEN } from '../ports/tokens';

export class SpawnReaderFacade implements SpawnReaderFacadePort {
  constructor(
    @Inject(ENTITY_SPAWN_REPOSITORY_TOKEN)
    private readonly entitySpawnRepository: EntitySpawnRepositoryPort,
  ) {}

  public getAll(): Promise<IEntitySpawn[]> {
    return this.entitySpawnRepository.getAll();
  }

  public get(id: IEntitySpawn['id']): Promise<IEntitySpawn | null> {
    return this.entitySpawnRepository.get(id);
  }
}
