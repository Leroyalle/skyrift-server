import type { MobSessionSnapshot } from 'src/realtime/mob-session';
import type { NpcSessionSnapshot } from 'src/realtime/npc-session';
import type { PlayerSessionSnapshot } from 'src/realtime/player-session';
import type { ISkillSession } from 'src/realtime/skill-session';

export class SessionClientMapper {
  public static mapPlayerSession = (
    session: PlayerSessionSnapshot,
  ): PlayerSessionSnapshot & {
    skills: ISkillSession[];
  } => {
    return {
      ...session,
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
