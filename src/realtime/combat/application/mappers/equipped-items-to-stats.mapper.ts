import type { EquipmentContainerFacadePort } from 'src/realtime/container';

import type { EquipmentItemStats } from '../../domain/types/calculate-payload.type';

type EquippedItems = Awaited<ReturnType<EquipmentContainerFacadePort['getEquippedItemsList']>>;

export class EquippedItemsToStatsMapper {
  public static map(equippedItems: EquippedItems): EquipmentItemStats[] {
    return equippedItems.map<EquipmentItemStats>(item => ({
      magicDamage: item.magicDamage ?? undefined,
      physicalDamage: item.physicalDamage ?? undefined,
      magicDefense: item.magicDefense ?? undefined,
      physicalDefense: item.physicalDefense ?? undefined,
    }));
  }
}
