import { registerEnumType } from '@nestjs/graphql';

export enum ItemTypeEnum {
  WEAPON = 'weapon',
  ARMOR = 'armor',
  POTION = 'potion',
  RESOURCE = 'resource',
  MISC = 'misc',
}

registerEnumType(ItemTypeEnum, {
  name: 'ItemTypeEnum',
  description: 'Типы предметов',
});
