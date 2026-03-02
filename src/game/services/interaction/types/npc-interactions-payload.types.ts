import { NpcServiceType } from 'src/common/enums/npc/npc-service-type.enum';
import { Armor, Weapon } from 'src/item/entities/item.entity';
import { Quest } from 'src/quest/entities/quest.entity';

export type TNpcServiceDataMap = {
  [NpcServiceType.Quests]: Quest[];
  [NpcServiceType.Repair]: {
    playerGold: number;
    repairableItems: ((Armor | Weapon) & { repairCost: number })[] | [];
  };
  [NpcServiceType.Shop]: null;
};

export type TNpcInteractionPayload = {
  [K in NpcServiceType]: {
    type: K;
    npcId: string;
    data: TNpcServiceDataMap[K];
  };
}[NpcServiceType];
