import { CharacterSkill } from 'src/character/character-skill/entities/character-skill.entity';
import { CurrentTarget } from 'src/character/types/live-character-state.type';
import { EntityType } from 'src/game/types/entity/entity-type.type';

export type CommonAttackerState = {
  id: string;
  characterSkills: CharacterSkill[] | null;
  x: number;
  y: number;
  locationId: string;
  currentTarget: CurrentTarget | null;
  attackRange: number;
  type: EntityType;
};
