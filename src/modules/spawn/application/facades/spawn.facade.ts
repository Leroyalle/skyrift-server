import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import { EntitySpawnRepositoryPort } from '../../domain/ports/entity-spawn-repository.port';
import { IEntitySpawn } from '../../domain/types/entity-spawn.type';
import { SpawnFacadePort } from '../ports/spawn-facade.port';
import { ENTITY_SPAWN_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class SpawnFacade implements SpawnFacadePort {
  constructor(
    @Inject(ENTITY_SPAWN_REPOSITORY_TOKEN)
    private readonly entitySpawnRepository: EntitySpawnRepositoryPort,
  ) {}

  public create(entitySpawn: Omit<IEntitySpawn, 'id'>): Promise<IEntitySpawn> {
    return this.entitySpawnRepository.save({ id: randomUUID(), ...entitySpawn });
  }

  public delete(id: IEntitySpawn['id']): Promise<void> {
    return this.entitySpawnRepository.delete(id);
  }
}
