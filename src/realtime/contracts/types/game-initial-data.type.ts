import type { AoeZone } from 'src/realtime/combat';
import type { IBagContainer, IEquipmentContainer } from 'src/realtime/container';
import type { ILocation } from 'src/realtime/location';
import type { MobSessionSnapshot } from 'src/realtime/mob-session';
import type { NpcSessionSnapshot } from 'src/realtime/npc-session';
import type { ClientPlayerSession } from 'src/realtime/player-session';

export interface GameInitialData {
  players: ClientPlayerSession[];
  mobs: MobSessionSnapshot[];
  aoeZones: AoeZone[];
  npcs: NpcSessionSnapshot[];
  location: ILocation;
  player: ClientPlayerSession;
  bag: IBagContainer;
  equipment: IEquipmentContainer;
}
