import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import type { CharacterFacadePort } from '../ports/character-facade.port';
import { FindCharacterByIdQuery } from '../queries/find-character-by-id/find-character-by-id.query';

@Injectable()
export class CharacterFacade implements CharacterFacadePort {
  constructor(private readonly queryBus: QueryBus) {}

  public findById(userId: string, characterId: string) {
    return this.queryBus.execute(new FindCharacterByIdQuery({ userId, characterId }));
  }
}
