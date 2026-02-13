import { ItemTypeEnum } from 'src/common/enums/item-type.enum';
import { ClientItem } from 'src/game/services/loot/types/loot.types';

import { BaseItem, Resource } from '../entities/item.entity';

export function isResource(item: BaseItem | ClientItem): item is Resource {
  return item.itemType === ItemTypeEnum.RESOURCE;
}
