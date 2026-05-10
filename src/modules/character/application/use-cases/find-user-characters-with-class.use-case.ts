import {
  CHARACTER_CLASS_READER_TOKEN,
  CharacterClassReaderPort,
} from 'src/modules/character-class';

import { Inject, Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import { CharacterSnapshot } from '../../domain/types/character.type';
import {
  CharacterWithClassDto,
  FindUserCharactersWithClassPort,
} from '../ports/find-user-characters-with-class.port';
import { FindCharactersByUserIdQuery } from '../queries/find-characters-by-user-id/find-characters-by-user-id.query';

@Injectable()
export class FindUserCharactersWithClassUseCase implements FindUserCharactersWithClassPort {
  constructor(
    @Inject(CHARACTER_CLASS_READER_TOKEN)
    private readonly characterClassReader: CharacterClassReaderPort,
    private readonly queryBus: QueryBus,
  ) {}

  public async execute(userId: string): Promise<CharacterWithClassDto[]> {
    const characters = await this.queryBus.execute<
      FindCharactersByUserIdQuery,
      CharacterSnapshot[]
    >(new FindCharactersByUserIdQuery(userId));

    if (!characters) return [];

    const charactersWithClass: CharacterWithClassDto[] = [];
    for (const character of characters) {
      const characterClass = await this.characterClassReader.findById(character.classId);
      if (!characterClass) throw new Error('Character class not found');

      charactersWithClass.push({ character, characterClass });
    }

    return charactersWithClass;
  }
}
