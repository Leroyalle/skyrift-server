import { getOrCreate } from 'src/game/lib/helpers/get-or-create-array.lib';
import { IRuntimeNpc } from 'src/game/services/characters/runtime-npc/types/runtime-npc.type';
import { Quest } from 'src/quest/entities/quest.entity';
import { QuestService } from 'src/quest/quest.service';

import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class QuestIndexService implements OnModuleInit {
  private readonly questsByNpc = new Map<string, string[]>();
  private readonly questsById = new Map<string, Quest>();
  constructor(private questService: QuestService) {}

  public async onModuleInit() {
    const quests = await this.questService.findAll();

    for (const quest of quests) {
      const array = getOrCreate(this.questsByNpc, quest.giverNpc.id, () => []);
      array.push(quest.id);
      this.questsById.set(quest.id, quest);
    }
  }

  public getById(questId: string) {
    return this.questsById.get(questId);
  }

  public getByNpc(npcId: string) {
    const array = this.questsByNpc.get(npcId) ?? [];
    return array.map(id => this.questsById.get(id)).filter((quest): quest is Quest => !!quest);
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
