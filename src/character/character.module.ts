import { Module } from '@nestjs/common';
import { CharacterService } from './character.service';
import { CharacterResolver } from './character.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Character } from './entities/character.entity';
import { CharacterSkillModule } from './character-skill/character-skill.module';
import { BagModule } from './bag/bag.module';
import { EquipmentModule } from './equipment/equipment.module';

@Module({
  imports: [TypeOrmModule.forFeature([Character]), CharacterSkillModule, BagModule, EquipmentModule],
  providers: [CharacterResolver, CharacterService],
  exports: [CharacterService],
})
export class CharacterModule {}
