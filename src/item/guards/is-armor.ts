import { ItemTypeEnum } from 'src/common/enums/item-type.enum';

import { Armor, BaseItem } from '../entities/item.entity';

export function isArmor(item: BaseItem): item is Armor {
  return item.itemType === ItemTypeEnum.ARMOR;
}
