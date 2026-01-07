import { Module } from '@nestjs/common';

import { CharacterClassResolver } from './character-class.resolver';
import { CharacterClassService } from './character-class.service';
import { SkillModule } from './skill/skill.module';

@Module({
  providers: [CharacterClassResolver, CharacterClassService],
  imports: [SkillModule],
})
export class CharacterClassModule {}
