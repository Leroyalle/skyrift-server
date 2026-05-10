import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OwnedSkillFacade } from './application/facades/owned-skill.facade';
import { OWNED_SKILL_FACADE_TOKEN, OWNED_SKILL_REPOSITORY_TOKEN } from './application/ports/tokens';
import { queries } from './application/queries/queries';
import { OwnedSkillOrmEntity } from './infrastructure/persistence/entities/owned-skill-orm.entity';
import { OwnedSkillPersistenceRepository } from './infrastructure/persistence/repositories/owned-skill-persistence.repository';

@Module({
  imports: [TypeOrmModule.forFeature([OwnedSkillOrmEntity])],
  providers: [
    {
      provide: OWNED_SKILL_REPOSITORY_TOKEN,
      useClass: OwnedSkillPersistenceRepository,
    },
    {
      provide: OWNED_SKILL_FACADE_TOKEN,
      useClass: OwnedSkillFacade,
    },
    ...queries,
  ],
  exports: [OWNED_SKILL_FACADE_TOKEN],
})
export class OwnedSkillModule {}
