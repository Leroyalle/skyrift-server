import { BaseEntityStates } from 'src/game/types/entity/base-entity-states.type';
import { Character } from '../entities/character.entity';
import { RuntimeActorEntity } from 'src/common/types/actor-entity.type';

export interface IRuntimeCharacter
  extends CharacterSummary,
    RuntimeActorEntity<'player'>,
    UniqueStats {}

export type CharacterSummary = Omit<
  Character,
  'location' | 'user' | 'items' | 'updatedAt' | 'createdAt' | 'isDeleted'
>;

interface UniqueStats {
  userId: string;
}

export type CharacterActionState = BaseEntityStates | 'pursue';
