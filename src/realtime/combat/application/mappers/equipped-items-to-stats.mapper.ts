import type { EquipmentContainerFacadePort } from 'src/realtime/container';

import type { EquipmentItemStats } from '../../domain/types/calculate-payload.type';

type EquippedItems = Awaited<ReturnType<EquipmentContainerFacadePort['getEquippedItemsList']>>;

export class EquippedItemsToStatsMapper {
  public static map(equippedItems: EquippedItems): EquipmentItemStats[] {
    return equippedItems.map<EquipmentItemStats>(item => ({
      magicDamage: item.stats.magicDamage,
      physicalDamage: item.stats.physicalDamage,
      magicDefense: item.stats.magicDefense,
      physicalDefense: item.stats.physicalDefense,
    }));
  }
}
