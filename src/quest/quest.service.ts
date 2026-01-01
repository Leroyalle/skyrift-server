import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Quest } from './entities/quest.entity';
import { Repository } from 'typeorm';
import { PlayerQuest } from './entities/player-quest.entity';

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
}
