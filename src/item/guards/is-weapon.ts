import { ItemTypeEnum } from 'src/common/enums/item-type.enum';

import { BaseItem, Weapon } from '../entities/item.entity';

export function isWeapon(item: BaseItem): item is Weapon {
  return item.itemType === ItemTypeEnum.WEAPON;
}
