import { CLOCK_TOKEN, SystemClockService } from 'src/realtime/shared/infrastructure/time';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CharacterClassModule } from '../character-class/character-class.module';

import { commands } from './application/commands/commands';
import { CharacterFacade } from './application/facades/character.facade';
import {
  CHARACTER_FACADE_TOKEN,
  CHARACTER_REPOSITORY_TOKEN,
  FIND_USER_CHARACTERS_WITH_CLASS_USE_CASE_TOKEN,
} from './application/ports/tokens';
import { queries } from './application/queries/queries';
import { FindUserCharactersWithClassUseCase } from './application/use-cases/find-user-characters-with-class.use-case';
import { CharacterOrmEntity } from './infrastructure/persistence/character-orm.entity';
import { CharacterRepository } from './infrastructure/persistence/character.repository';
import { CharacterGraphqlController } from './presentation/controllers/character.graphql.controller';

@Module({
  imports: [CharacterClassModule, TypeOrmModule.forFeature([CharacterOrmEntity])],
  providers: [
    {
      provide: CHARACTER_REPOSITORY_TOKEN,
      useClass: CharacterRepository,
    },
    {
      provide: CHARACTER_FACADE_TOKEN,
      useClass: CharacterFacade,
    },
    {
      provide: CLOCK_TOKEN,
      useClass: SystemClockService,
    },
    {
      provide: FIND_USER_CHARACTERS_WITH_CLASS_USE_CASE_TOKEN,
      useClass: FindUserCharactersWithClassUseCase,
    },
    CharacterGraphqlController,
    ...commands,
    ...queries,
  ],
  exports: [CHARACTER_FACADE_TOKEN],
})
export class CharacterModule {}
