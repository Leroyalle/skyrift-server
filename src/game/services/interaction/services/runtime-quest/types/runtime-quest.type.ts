import { PlayerQuest } from 'src/quest/entities/player-quest.entity';

export type IRuntimeQuest = Omit<PlayerQuest, 'id' | 'updatedAt' | 'createdAt' | 'player'>;
