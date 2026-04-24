import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CharacterClassReaderAdapter } from './application/adapters/character-class-reader.adapter';
import {
  CHARACTER_CLASS_READER_TOKEN,
  CHARACTER_CLASS_REPOSITORY,
} from './application/ports/tokens';
import { CharacterClassOrmEntity } from './infrastructure/persistence/character-class-orm.entity';
import { CharacterClassRepository } from './infrastructure/persistence/character-class.infrastructure';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([CharacterClassOrmEntity])],
  providers: [
    {
      provide: CHARACTER_CLASS_REPOSITORY,
      useClass: CharacterClassRepository,
    },
    {
      provide: CHARACTER_CLASS_READER_TOKEN,
      useClass: CharacterClassReaderAdapter,
    },
  ],
  exports: [CHARACTER_CLASS_READER_TOKEN],
})
export class CharacterClassModule {}
