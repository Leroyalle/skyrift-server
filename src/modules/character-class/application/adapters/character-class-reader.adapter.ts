import type { CharacterClassReaderPort } from 'src/modules/character/application/ports/character-class-reader.port';

import { Injectable } from '@nestjs/common';
import type { QueryBus } from '@nestjs/cqrs';

import { FindAllClassesQuery } from '../queries/find-all/find-all-classes.query';
import { FindClassByIdQuery } from '../queries/find-by-id/find-class-by-id.query';

@Injectable()
export class CharacterClassReaderAdapter implements CharacterClassReaderPort {
  constructor(private readonly queryBus: QueryBus) {}

  public async findById(id: string) {
    return this.queryBus.execute(new FindClassByIdQuery(id));
  }

  public async findAll() {
    return this.queryBus.execute(new FindAllClassesQuery());
  }
}
