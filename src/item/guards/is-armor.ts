import { ItemTypeEnum } from 'src/common/enums/item-type.enum';
import { ClientItem } from 'src/game/services/loot/types/loot.types';

import { Armor, BaseItem } from '../entities/item.entity';

export function isArmor(item: BaseItem | ClientItem): item is Armor {
  return item.itemType === ItemTypeEnum.ARMOR;
}
