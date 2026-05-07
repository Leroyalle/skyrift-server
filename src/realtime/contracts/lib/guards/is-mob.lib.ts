import type { MobSessionSnapshot } from 'src/realtime/mob-session';

import type { TEntitySession } from '../../types/entity-session.type';

export const isMob = (entity: TEntitySession): entity is MobSessionSnapshot => {
  return entity.type === 'mob';
};
