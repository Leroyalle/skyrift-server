import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CharacterClassModule } from '../character-class/character-class.module';

import { CharacterFacade } from './application/facades/character.facade';
import { CHARACTER_FACADE_TOKEN, CHARACTER_REPOSITORY_TOKEN } from './application/ports/tokens';
import { CharacterOrmEntity } from './infrastructure/persistence/character-orm.entity';
import { CharacterRepository } from './infrastructure/persistence/character.repository';

@Module({
  imports: [CqrsModule, CharacterClassModule, TypeOrmModule.forFeature([CharacterOrmEntity])],
  providers: [
    {
      provide: CHARACTER_REPOSITORY_TOKEN,
      useClass: CharacterRepository,
    },
    {
      provide: CHARACTER_FACADE_TOKEN,
      useClass: CharacterFacade,
    },
  ],
  exports: [CHARACTER_FACADE_TOKEN],
})
export class CharacterModule {}
