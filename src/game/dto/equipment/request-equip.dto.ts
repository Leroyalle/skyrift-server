import { TItem } from 'src/common/types/item.type';

import { RequestUnEquipDto } from './request-un-equip.dto';

export class RequestEquipDto extends RequestUnEquipDto {
  item: TItem;
}
