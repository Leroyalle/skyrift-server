import { Inject, Injectable } from '@nestjs/common';

import type { EntitySpawnRepositoryPort } from '../../domain/ports/entity-spawn-repository.port';
import type { IEntitySpawn } from '../../domain/types/entity-spawn.type';
import { ENTITY_SPAWN_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class CreateSpawnUseCase {
  constructor(
    @Inject(ENTITY_SPAWN_REPOSITORY_TOKEN)
    private readonly spawnRepository: EntitySpawnRepositoryPort,
  ) {}

  public execute(spawn: IEntitySpawn) {
    return this.spawnRepository.save(spawn);
  }
}
