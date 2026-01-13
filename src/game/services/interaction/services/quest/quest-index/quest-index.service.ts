import { getOrCreate } from 'src/game/lib/helpers/get-or-create-array.lib';
import { IRuntimeNpc } from 'src/game/services/characters/runtime-npc/types/runtime-npc.type';
import { Quest } from 'src/quest/entities/quest.entity';
import { QuestService } from 'src/quest/quest.service';

import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class QuestIndexService implements OnModuleInit {
  private readonly questIndex = new Map<string, Quest[]>();
  constructor(private questService: QuestService) {}

  public async onModuleInit() {
    const quests = await this.questService.findAll();

    for (const quest of quests) {
      const array = getOrCreate(this.questIndex, quest.giverNpc.id, () => []);
      array.push(quest);
    }
  }

  public getByNpc(npcId: string) {
    return this.questIndex.get(npcId) ?? [];
  }

  public getByNpcs(npcs: IRuntimeNpc[]) {
    const quests: Quest[] = [];
    for (const npc of npcs) {
      const array = this.getByNpc(npc.id);
      quests.push(...array);
    }
    return quests;
  }
}
