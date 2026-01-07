import { ItemTypeEnum } from 'src/common/enums/item-type.enum';

import { BaseItem, Resource } from '../entities/item.entity';

export function isResource(item: BaseItem): item is Resource {
  return item.itemType === ItemTypeEnum.RESOURCE;
}
