import { randomUUID } from 'node:crypto';

import { Inject, Injectable } from '@nestjs/common';

import { FactionPersistenceRepositoryPort } from '../../domain/ports/faction-persistence-repository.port';
import { Faction } from '../../domain/types/faction.type';
import { FactionFacadePort } from '../ports/faction-facade.port';
import { FACTION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class FactionFacade implements FactionFacadePort {
  constructor(
    @Inject(FACTION_REPOSITORY_TOKEN)
    private readonly factionRepository: FactionPersistenceRepositoryPort,
  ) {}

  public create(faction: Omit<Faction, 'id'>) {
    return this.factionRepository.save({
      description: faction.description,
      logo: faction.logo,
      name: faction.name,
      id: randomUUID(),
    });
  }

  public delete(id: string) {
    return this.factionRepository.delete(id);
  }
}
