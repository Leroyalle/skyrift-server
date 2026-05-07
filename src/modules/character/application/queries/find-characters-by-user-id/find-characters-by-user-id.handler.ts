import { CharacterRepositoryPort } from 'src/modules/character/domain/ports/character-repository.port';

import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CHARACTER_REPOSITORY_TOKEN } from '../../ports/tokens';

import { FindCharactersByUserIdQuery } from './find-characters-by-user-id.query';

@QueryHandler(FindCharactersByUserIdQuery)
export class FindCharactersByUserIdHandler implements IQueryHandler<FindCharactersByUserIdQuery> {
  constructor(
    @Inject(CHARACTER_REPOSITORY_TOKEN)
    private readonly characterRepository: CharacterRepositoryPort,
  ) {}

  public async execute(query: FindCharactersByUserIdQuery) {
    const result = await this.characterRepository.findUserCharacters(query.userId);
    if (!result) return [];
    return result.map(char => char.snapshot());
  }
}
