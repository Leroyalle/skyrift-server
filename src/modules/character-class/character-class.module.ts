import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CharacterClassReaderAdapter } from './application/adapters/character-class-reader.adapter';
import { commands } from './application/commands/commands';
import { CharacterClassFacade } from './application/facades/character-class.facade';
import {
  CHARACTER_CLASS_FACADE_TOKEN,
  CHARACTER_CLASS_READER_TOKEN,
  CHARACTER_CLASS_REPOSITORY,
} from './application/ports/tokens';
import { queries } from './application/queries/quries';
import { CharacterClassOrmEntity } from './infrastructure/persistence/character-class-orm.entity';
import { CharacterClassRepository } from './infrastructure/persistence/character-class.infrastructure';

@Module({
  imports: [TypeOrmModule.forFeature([CharacterClassOrmEntity])],
  providers: [
    {
      provide: CHARACTER_CLASS_REPOSITORY,
      useClass: CharacterClassRepository,
    },
    {
      provide: CHARACTER_CLASS_READER_TOKEN,
      useClass: CharacterClassReaderAdapter,
    },
    { provide: CHARACTER_CLASS_FACADE_TOKEN, useClass: CharacterClassFacade },
    ...commands,
    ...queries,
  ],
  exports: [CHARACTER_CLASS_READER_TOKEN, CHARACTER_CLASS_FACADE_TOKEN],
})
export class CharacterClassModule {}
