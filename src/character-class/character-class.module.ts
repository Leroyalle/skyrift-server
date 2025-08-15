import { Module } from '@nestjs/common';
import { CharacterClassService } from './character-class.service';
import { CharacterClassResolver } from './character-class.resolver';
import { SkillModule } from './skill/skill.module';

@Module({
  providers: [CharacterClassResolver, CharacterClassService],
  imports: [SkillModule],
})
export class CharacterClassModule {}
