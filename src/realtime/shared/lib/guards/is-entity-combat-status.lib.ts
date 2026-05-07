import type { EntitySnapshot } from 'src/realtime/entity-registry';

export const isEntityCombatStatus = (
  status: EntitySnapshot['state']['current'],
): status is CombatStatus => {
  return (combatStatuses as readonly string[]).includes(status);
};

function makeStatuses<T extends EntitySnapshot['state']['current']>() {
  return <U extends T[]>(arr: U) => arr;
}

export const combatStatuses = makeStatuses<EntitySnapshot['state']['current']>()([
  'return',
  'attacking',
  'pursue',
] as const);

export type CombatStatus = (typeof combatStatuses)[number];
