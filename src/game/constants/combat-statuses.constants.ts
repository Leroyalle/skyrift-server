import { RuntimeEntity } from 'src/game/types/entity/runtime-entity.type';

function makeStatuses<T extends RuntimeEntity['state']>() {
  return <U extends T[]>(arr: U) => arr;
}

export const combatStatuses = makeStatuses<RuntimeEntity['state']>()([
  'return',
  'attack',
  'pursue',
] as const);

export type CombatStatus = (typeof combatStatuses)[number];
