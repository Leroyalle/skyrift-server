import { registerEnumType } from '@nestjs/graphql';

export enum NpcServiceType {
  Quests = 'quests',
  Repair = 'repair',
  Shop = 'shop',
}
registerEnumType(NpcServiceType, {
  name: 'NpcServiceType',
  description: 'Действие нпс',
});
