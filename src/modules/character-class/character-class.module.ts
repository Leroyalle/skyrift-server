import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { CharacterClassReaderAdapter } from './application/adapters/character-class-reader.adapter';
import { CHARACTER_CLASS_REPOSITORY } from './application/ports/tokens';
import { CharacterClassRepository } from './infrastructure/persistence/character-class.infrastructure';

@Module({
  imports: [CqrsModule],
  providers: [
    {
      provide: CHARACTER_CLASS_REPOSITORY,
      useClass: CharacterClassRepository,
    },
  ],
  exports: [CharacterClassReaderAdapter],
})
export class CharacterClassModule {}
