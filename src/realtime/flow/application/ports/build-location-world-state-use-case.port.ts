import type { AoeZone } from 'src/realtime/combat';
import { EntityWithEquipment } from 'src/realtime/contracts/types/entity-with-equipment.type';
import type { ILocation } from 'src/realtime/location';
import type { MobSessionSnapshot } from 'src/realtime/mob-session';
import type { NpcSessionSnapshot } from 'src/realtime/npc-session';
import type { ClientPlayerSession } from 'src/realtime/player-session';

export interface BuildLocationWorldStatePort {
  execute(locationId: string): Promise<BuildLocationWorldStateResult>;
}

export interface BuildLocationWorldStateResult {
  players: EntityWithEquipment<ClientPlayerSession>[];
  mobs: EntityWithEquipment<MobSessionSnapshot>[];
  aoeZones: AoeZone[];
  npcs: EntityWithEquipment<NpcSessionSnapshot>[];
  location: ILocation;
}
