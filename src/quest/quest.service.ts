import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PlayerQuest } from './entities/player-quest.entity';
import { Quest } from './entities/quest.entity';

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

  public async findAll() {
    return await this.questRepository.find({ relations: { giverNpc: true } });
  }

  public async markAsCompleted(id: string) {
    return await this.playerQuestRepository.update(id, { completedAt: new Date() });
  }

  public async createQuest(quest: Omit<Quest, 'id'>) {
    console.log('quest');
    return await this.questRepository.save(quest);
  }

  public async createPlayerQuest(playerQuest: Omit<PlayerQuest, 'id' | 'createdAt' | 'updatedAt'>) {
    return await this.playerQuestRepository.save(playerQuest);
  }
}
