import { IEquipmentContainer } from 'src/realtime/container';
import { EntityWithEquipment } from 'src/realtime/contracts/types/entity-with-equipment.type';
import type { MobSessionSnapshot } from 'src/realtime/mob-session';
import type { NpcSessionSnapshot } from 'src/realtime/npc-session';
import type { ClientPlayerSession, PlayerSessionSnapshot } from 'src/realtime/player-session';

export class SessionClientMapper {
  public static mapPlayerSession = (
    session: PlayerSessionSnapshot,
    equipment: IEquipmentContainer,
  ): EntityWithEquipment<ClientPlayerSession> => {
    const { skillsById: _, ...cutSession } = session;
    return {
      ...cutSession,
      skills: Array.from(session.skillsById.values()),
      equipment,
    };
  };

  public static mapMobSession = (
    session: MobSessionSnapshot,
    equipment: IEquipmentContainer,
  ): EntityWithEquipment<MobSessionSnapshot> => {
    return { ...session, equipment };
  };

  public static mapNpcSession = (
    session: NpcSessionSnapshot,
    equipment: IEquipmentContainer,
  ): EntityWithEquipment<NpcSessionSnapshot> => {
    return { ...session, equipment };
  };
}
