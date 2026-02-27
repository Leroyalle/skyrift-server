import { NpcServiceType } from 'src/common/enums/npc/npc-service-type.enum';
import { Quest } from 'src/quest/entities/quest.entity';

export type TNpcServiceDataMap = {
  [NpcServiceType.Quests]: Quest[];
  [NpcServiceType.Repair]: null;
  [NpcServiceType.Shop]: null;
};

export type TNpcInteractionPayload = {
  [K in NpcServiceType]: {
    type: K;
    npcId: string;
    data: TNpcServiceDataMap[K];
  };
}[NpcServiceType];
