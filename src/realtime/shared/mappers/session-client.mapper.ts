import type { MobSessionSnapshot } from 'src/realtime/mob-session';
import type { NpcSessionSnapshot } from 'src/realtime/npc-session';
import type { ClientPlayerSession, PlayerSessionSnapshot } from 'src/realtime/player-session';

export class SessionClientMapper {
  public static mapPlayerSession = (session: PlayerSessionSnapshot): ClientPlayerSession => {
    const { skillsById: _, ...cutSession } = session;
    return {
      ...cutSession,
      skills: Array.from(session.skillsById.values()),
    };
  };

  public static mapMobSession = (session: MobSessionSnapshot): MobSessionSnapshot => {
    return session;
  };

  public static mapNpcSession = (session: NpcSessionSnapshot): NpcSessionSnapshot => {
    return session;
  };
}
