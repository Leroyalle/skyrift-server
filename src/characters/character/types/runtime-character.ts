import { RuntimeActorEntity } from 'src/common/types/actor-entity.type';
import { IRuntimeQuest } from 'src/game/services/interaction/services/runtime-quest/types/runtime-quest.type';
import { BaseEntityStates } from 'src/game/types/entity/base-entity-states.type';

import { Character } from '../entities/character.entity';

export interface IRuntimeCharacter
  extends CharacterSummary, RuntimeActorEntity<'player'>, UniqueStats, QuestState {}

export type CharacterSummary = Omit<
  Character,
  'location' | 'user' | 'items' | 'updatedAt' | 'createdAt' | 'isDeleted' | 'quests'
>;

interface UniqueStats {
  userId: string;
}

interface QuestState {
  completedQuestIds: Set<string>;
  activeQuests: IRuntimeQuest[];
}

export type CharacterActionState = BaseEntityStates | 'pursue';
