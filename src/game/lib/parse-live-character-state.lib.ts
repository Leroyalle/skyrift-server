import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';

// FIXME: check
export function parseLiveCharacterState(raw: Record<string, string>): IRuntimeCharacter {
  return {} as IRuntimeCharacter;
  // return {
  //   id: raw.id,
  //   name: raw.name,
  //   x: Number(raw.x),
  //   y: Number(raw.y),
  //   level: Number(raw.level),
  //   maxHp: Number(raw.maxHp),
  //   hp: Number(raw.hp),
  //   type: 'player',
  //   // defense: Number(raw.defense),
  //   attackRange: Number(raw.attackRange),
  //   isAlive: raw.isAlive === 'true',
  //   baseMagicDamage: Number(raw.baseMagicDamage),
  //   basePhysicalDamage: Number(raw.basePhysicalDamage),
  //   locationId: raw.locationId,
  //   attackSpeed: Number(raw.attackSpeed),
  //   lastMoveAt: Number(raw.lastMoveAt),
  //   lastAttackAt: Number(raw.lastAttackAt),
  //   userId: raw.userId,
  //   isAttacking: raw.isAttacking === 'true',
  //   lastHpRegenerationTime: Number(raw.lastHpRegenerationTime),
  //   currentTarget: JSON.parse(raw.currentTarget),
  //   characterSkills: JSON.parse(raw.characterSkills),
  //   characterClass: JSON.parse(raw.characterClass),
  // };
}
