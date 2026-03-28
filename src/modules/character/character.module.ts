import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { CharacterClassReaderAdapter } from '../character-class/application/adapters/character-class-reader.adapter';
import { CharacterClassModule } from '../character-class/character-class.module';

import {
  CHARACTER_CLASS_READER_TOKEN,
  CHARACTER_REPOSITORY_TOKEN,
} from './application/ports/tokens';
import { CharacterRepository } from './infrastructure/persistence/character.repository';

@Module({
  imports: [CqrsModule, CharacterClassModule],
  providers: [
    {
      provide: CHARACTER_REPOSITORY_TOKEN,
      useClass: CharacterRepository,
    },
    {
      provide: CHARACTER_CLASS_READER_TOKEN,
      useClass: CharacterClassReaderAdapter,
    },
  ],
})
export class CharacterModule {}
