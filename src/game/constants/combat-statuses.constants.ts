import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';

function makeStatuses<T extends TRuntimeEntity['state']>() {
  return <U extends T[]>(arr: U) => arr;
}

export const combatStatuses = makeStatuses<TRuntimeEntity['state']>()([
  'return',
  'attack',
  'pursue',
] as const);

export type CombatStatus = (typeof combatStatuses)[number];
