import { Inject, Injectable } from '@nestjs/common';

import { FactionPersistenceRepositoryPort } from '../../domain/ports/faction-persistence-repository.port';
import { Faction } from '../../domain/types/faction.type';
import { FactionReaderPort } from '../ports/faction-reader.port';
import { FACTION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class FactionReader implements FactionReaderPort {
  constructor(
    @Inject(FACTION_REPOSITORY_TOKEN)
    private readonly factionRepository: FactionPersistenceRepositoryPort,
  ) {}

  public findById(id: string): Promise<Faction | null> {
    return this.factionRepository.findById(id);
  }

  public findAll(): Promise<Faction[]> {
    return this.factionRepository.findAll();
  }
}
