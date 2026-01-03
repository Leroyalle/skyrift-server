import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { ActiveAoEZone } from '../services/combat/services/aoe/types/active-aoe-zone.type';
import { CachedLocation } from 'src/world/location/types/cashed-location.type';
import { IRuntimeMob } from '../services/characters/runtime-mob/types/runtime-mob.type';

export interface GameInitialData {
  character: IRuntimeCharacter;
  players: IRuntimeCharacter[];
  mobs: IRuntimeMob[];
  aoeZones: ActiveAoEZone[];
  location: CachedLocation;
}
