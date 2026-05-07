import type { PlayerSessionSnapshot } from 'src/realtime/player-session';

import type { TEntitySession } from '../../types/entity-session.type';

export const isPlayer = (entity: TEntitySession): entity is PlayerSessionSnapshot => {
  return entity.type === 'player';
};
