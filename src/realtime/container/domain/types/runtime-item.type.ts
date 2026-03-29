import type { RuntimeEquippableItem } from './equippable-item.type';

export type RuntimeContainerType = 'player-bag' | 'player-equipment' | 'chest' | 'ground';

export type BaseItem = {
  id: string;
  name: string;
};

// export type RuntimeConsumableItem = ...
// export type RuntimeResourceItem = ...

export type RuntimeItem = RuntimeEquippableItem;
// | RuntimeConsumableItem
// | RuntimeResourceItem;
