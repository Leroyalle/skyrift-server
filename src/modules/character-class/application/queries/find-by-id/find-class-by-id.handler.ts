import type { CharacterClassRepositoryPort } from 'src/modules/character-class/domain/ports/character-class.repository';

import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CharacterClassClientMapper } from '../../mappers/character-class-client.mapper';
import { CHARACTER_CLASS_REPOSITORY } from '../../ports/tokens';

import { FindClassByIdQuery } from './find-class-by-id.query';

@QueryHandler(FindClassByIdQuery)
export class FindClassByIdHandler implements IQueryHandler<FindClassByIdQuery> {
  constructor(
    @Inject(CHARACTER_CLASS_REPOSITORY)
    private readonly characterClassRepository: CharacterClassRepositoryPort,
  ) {}

  public async execute(query: FindClassByIdQuery) {
    const entity = await this.characterClassRepository.findOne(query.id);

    if (!entity) {
      throw new Error('Character class not found');
    }

    return CharacterClassClientMapper.toClient(entity);
  }
}
