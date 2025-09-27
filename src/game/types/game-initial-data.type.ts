import { IRuntimeCharacter } from 'src/character/types/runtime-character';
import { IRuntimeMob } from '../services/runtime-mob/types/runtime-mob.type';
import { ActiveAoEZone } from '../services/combat/types/active-aoe-zone.type';
import { CachedLocation } from 'src/location/types/cashed-location.type';

export interface GameInitialData {
  character: IRuntimeCharacter;
  players: IRuntimeCharacter[];
  mobs: IRuntimeMob[];
  aoeZones: ActiveAoEZone[];
  location: CachedLocation;
}
