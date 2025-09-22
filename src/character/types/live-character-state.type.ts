import { EntityType } from 'src/game/types/entity-type.type';
import { CharacterSkill } from '../character-skill/entities/character-skill.entity';
import { CharacterClass } from 'src/character-class/entities/character-class.entity';

export type LiveCharacter = {
  id: string;
  name: string;
  x: number;
  y: number;
  level: number;
  hp: number;
  maxHp: number;
  defense: number;
  attackRange: number;
  attackSpeed: number;
  isAlive: boolean;
  basePhysicalDamage: number;
  baseMagicDamage: number;
  lastMoveAt: number;
  lastAttackAt: number;
  locationId: string;
  userId: string;
  isAttacking: boolean;
  lastHpRegenerationTime: number;
  currentTarget: CurrentTarget | null;
  characterSkills: CharacterSkill[];
  characterClass: CharacterClass;
  type: EntityType;
  // TODO: add the damage(now) - sum all damage items
};

export type CurrentTarget = {
  id: string;
  type: EntityType;
};
