import { Module } from '@nestjs/common';
import { CharacterClassService } from './character-class.service';
import { CharacterClassResolver } from './character-class.resolver';

@Module({
  providers: [CharacterClassResolver, CharacterClassService],
})
export class CharacterClassModule {}
