import { Character } from 'src/characters/character/entities/character.entity';
import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { PlayerQuest } from 'src/quest/entities/player-quest.entity';

export const buildRuntimeCharacter = (character: Character): IRuntimeCharacter => {
  return {
    id: character.id,
    appearance: character.appearance,
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
    // equipment: { id, ...equip } = character.equipment,
    equipment: character.equipment,
    completedQuestIds: collectCompletedQuests(character.quests),
    activeQuests: collectActiveQuests(character.quests),
  };
};

function collectCompletedQuests(quests: PlayerQuest[]) {
  return quests.reduce<Set<string>>((acc, quest) => {
    if (quest.completedAt) {
      acc.add(quest.id);
    }
    return acc;
  }, new Set());
}

function collectActiveQuests(quests: PlayerQuest[]) {
  return quests.reduce<Array<PlayerQuest>>((acc, quest) => {
    if (!quest.completedAt) {
      acc.push(quest);
    }
    return acc;
  }, []);
}
