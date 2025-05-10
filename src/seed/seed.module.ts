import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Location } from 'src/location/entities/location.entity';
import { LocationLayer } from 'src/location/entities/location-layer.entity';
import { Faction } from 'src/faction/entities/faction.entity';
import { CharacterClass } from 'src/character-class/entities/character-class.entity';
import { Character } from 'src/character/entities/character.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Location,
      LocationLayer,
      Faction,
      CharacterClass,
      Character,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
