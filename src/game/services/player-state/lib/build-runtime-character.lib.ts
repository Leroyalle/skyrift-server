import { Character } from 'src/characters/character/entities/character.entity';
import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';

export const buildRuntimeCharacter = (character: Character): IRuntimeCharacter => {
  return {
    id: character.id,
    name: character.name,
    x: character.x,
    y: character.y,
    level: character.level,
    maxHp: character.maxHp,
    hp: character.hp,
    physicalDefense: character.physicalDefense,
    magicDefense: character.magicDefense,
    attackRange: character.attackRange,
    isAlive: character.isAlive,
    state: 'idle',
    critMultiplier: character.critMultiplier,
    experience: character.experience,
    skillPoints: character.skillPoints,
    experienceToNextLevel: character.experienceToNextLevel,
    basePhysicalDamage: character.basePhysicalDamage,
    baseMagicDamage: character.baseMagicDamage,
    locationId: character.locationId,
    attackSpeed: character.attackSpeed,
    lastMoveAt: 0,
    lastAttackAt: 0,
    lastHpRegenerationTime: 0,
    userId: character.user.id,
    isAttacking: false,
    currentTarget: null,
    characterSkills: character.characterSkills,
    characterClass: character.characterClass,
    type: 'player',
    walkSpeed: character.walkSpeed,
    bag: character.bag,
    equipment: character.equipment,
  };
};
