import type { CharacterRepositoryPort } from 'src/modules/character/domain/ports/character-repository.port';

import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CHARACTER_REPOSITORY_TOKEN } from '../../ports/tokens';

import { FindCharacterByIdQuery } from './find-character-by-id.query';

@QueryHandler(FindCharacterByIdQuery)
export class FindCharacterByIdHandler implements IQueryHandler<FindCharacterByIdQuery> {
  constructor(
    @Inject(CHARACTER_REPOSITORY_TOKEN)
    private readonly characterRepository: CharacterRepositoryPort,
  ) {}

  public async execute(query: FindCharacterByIdQuery) {
    const character = await this.characterRepository.findOwnedCharacter(
      query.props.userId,
      query.props.characterId,
    );
    if (!character) return null;
    return character.snapshot();
  }
}
