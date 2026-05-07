import type { AoeZone } from 'src/realtime/combat';
import type { IBagContainer } from 'src/realtime/container';
import type { ILocation } from 'src/realtime/location';
import type { MobSessionSnapshot } from 'src/realtime/mob-session';
import type { NpcSessionSnapshot } from 'src/realtime/npc-session';
import type { ClientPlayerSession } from 'src/realtime/player-session';

import { EntityWithEquipment } from './entity-with-equipment.type';

export interface GameInitialData {
  players: EntityWithEquipment<ClientPlayerSession>[];
  mobs: EntityWithEquipment<MobSessionSnapshot>[];
  aoeZones: AoeZone[];
  npcs: EntityWithEquipment<NpcSessionSnapshot>[];
  location: ILocation;
  player: EntityWithEquipment<ClientPlayerSession>;
  bag: IBagContainer;
}
