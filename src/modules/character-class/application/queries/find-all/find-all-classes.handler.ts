import type { CharacterClassRepositoryPort } from 'src/modules/character-class/domain/ports/character-class.repository';

import { Inject } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import {
  type CharacterClassClientDto,
  CharacterClassClientMapper,
} from '../../mappers/character-class-client.mapper';
import { CHARACTER_CLASS_REPOSITORY } from '../../ports/tokens';

import { FindAllClassesQuery } from './find-all-classes.query';

@QueryHandler(FindAllClassesQuery)
export class FindAllClassesHandler implements IQueryHandler<FindAllClassesQuery> {
  constructor(
    @Inject(CHARACTER_CLASS_REPOSITORY)
    private readonly characterClassRepository: CharacterClassRepositoryPort,
  ) {}

  public async execute(): Promise<CharacterClassClientDto[]> {
    const result = await this.characterClassRepository.findAll();
    return Promise.resolve(result.map(CharacterClassClientMapper.toClient));
  }
}
