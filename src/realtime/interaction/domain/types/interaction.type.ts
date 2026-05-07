import type { IPositionTile } from 'src/realtime/shared/types/position.type';

export type Interaction = {
  characterId: string;
} & (TalkInteraction | TeleportInteraction);

interface TalkInteraction {
  type: 'talk';
  targetId: string;
}

interface TeleportInteraction {
  type: 'teleport';
  targetId: string;
  area: IPositionTile;
}
