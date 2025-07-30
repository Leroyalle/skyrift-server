import { LiveCharacterState } from 'src/character/types/live-character-state.type';

export function parseLiveCharacterState(
  raw: Record<string, string>,
): LiveCharacterState {
  return {
    id: raw.id,
    name: raw.name,
    x: Number(raw.x),
    y: Number(raw.y),
    level: Number(raw.level),
    maxHp: Number(raw.maxHp),
    hp: Number(raw.hp),
    defense: Number(raw.defense),
    attackRange: Number(raw.attackRange),
    isAlive: raw.isAlive === 'true',
  };
}
