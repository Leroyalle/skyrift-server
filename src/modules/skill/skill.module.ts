import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SkillFacade } from './application/facades/skill.facade';
import { SKILL_FACADE_TOKEN, SKILL_PERSISTENCE_REPOSITORY_TOKEN } from './application/ports/tokens';
import { SkillOrmEntity } from './infrastructure/persistence/entities/skill-orm.entity';
import { SkillPersistenceRepository } from './infrastructure/persistence/repositories/skill-persistence.repository';

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([SkillOrmEntity])],
  providers: [
    {
      provide: SKILL_PERSISTENCE_REPOSITORY_TOKEN,
      useClass: SkillPersistenceRepository,
    },
    {
      provide: SKILL_FACADE_TOKEN,
      useClass: SkillFacade,
    },
  ],
  exports: [SKILL_FACADE_TOKEN],
})
export class SkillModule {}
