import { IRuntimeNpc } from 'src/game/services/characters/runtime-npc/types/runtime-npc.type';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';

export const isNpc = (entity: TRuntimeEntity): entity is IRuntimeNpc => {
  return entity.type === 'npc';
};
