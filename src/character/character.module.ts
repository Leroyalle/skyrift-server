import { Module } from '@nestjs/common';
import { CharacterService } from './character.service';
import { CharacterResolver } from './character.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from './entities/character.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Character])],
  providers: [CharacterResolver, CharacterService],
  exports: [CharacterService],
})
export class CharacterModule {}
