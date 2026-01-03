import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Quest } from './entities/quest.entity';
import { Repository } from 'typeorm';
import { PlayerQuest } from './entities/player-quest.entity';
import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';

@Injectable()
export class QuestService {
  constructor(
    @InjectRepository(Quest) private readonly questRepository: Repository<Quest>,
    @InjectRepository(PlayerQuest) private readonly playerQuestRepository: Repository<PlayerQuest>,
  ) {}

  public async findAllByCharacterId(characterId: string) {
    return await this.questRepository.find({
      where: { playerQuests: { player: { id: characterId } } },
    });
  }

  public async findById(id: string) {
    return await this.questRepository.findOneBy({ id });
  }

  public async markAsCompleted(id: string) {
    return await this.playerQuestRepository.update(id, { completedAt: new Date() });
  }

  public async createQuest(quest: Omit<Quest, 'id'>) {
    return await this.questRepository.save(quest);
  }

  public async createPlayerQuest(playerQuest: Omit<PlayerQuest, 'id' | 'createdAt' | 'updatedAt'>) {
    return await this.playerQuestRepository.save(playerQuest);
  }

  public getAvailableQuests(playerState: IRuntimeCharacter, quests: Quest[]) {
    const availbleQuests = quests.filter(quest => {
      quest.prerequisites.every(prerequisite => {
        if (prerequisite.type === 'level') {
          return playerState.level >= prerequisite.minLevel;
        } else if (prerequisite.type === 'quest_completed') {
          return playerState.completedQuestIds.has(quest.id);
        }
      });
    });

    return availbleQuests;
  }
}
