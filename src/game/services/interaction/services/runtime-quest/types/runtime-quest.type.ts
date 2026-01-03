import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { PlayerQuest } from 'src/quest/entities/player-quest.entity';

export type IRuntimeQuest = Omit<PlayerQuest, 'id' | 'updatedAt' | 'createdAt' | 'player'> & {
  player: IRuntimeCharacter;
};
