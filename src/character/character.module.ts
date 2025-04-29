import { Module } from '@nestjs/common';
import { CharacterService } from './character.service';
import { CharacterResolver } from './character.resolver';

@Module({
  providers: [CharacterResolver, CharacterService],
})
export class CharacterModule {}
