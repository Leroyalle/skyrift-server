import { BaseEntityStates } from 'src/game/types/entity/base-entity-states.type';
import { Character } from '../entities/character.entity';
import { RuntimeActorEntity } from 'src/common/types/actor-entity.type';
import { PlayerQuest } from 'src/quest/entities/player-quest.entity';

export interface IRuntimeCharacter
  extends CharacterSummary,
    RuntimeActorEntity<'player'>,
    UniqueStats,
    QuestState {}

export type CharacterSummary = Omit<
  Character,
  'location' | 'user' | 'items' | 'updatedAt' | 'createdAt' | 'isDeleted' | 'quests'
>;

interface UniqueStats {
  userId: string;
}

interface QuestState {
  completedQuestIds: Set<string>;
  activeQuests: PlayerQuest[];
}

export type CharacterActionState = BaseEntityStates | 'pursue';
