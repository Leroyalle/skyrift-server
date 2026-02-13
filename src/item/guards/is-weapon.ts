import { ItemTypeEnum } from 'src/common/enums/item-type.enum';
import { ClientItem } from 'src/game/services/loot/types/loot.types';

import { BaseItem, Weapon } from '../entities/item.entity';

export function isWeapon(item: BaseItem | ClientItem): item is Weapon {
  return item.itemType === ItemTypeEnum.WEAPON;
}
