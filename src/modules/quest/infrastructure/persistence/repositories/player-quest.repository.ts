import type { PlayerQuest } from 'src/modules/quest/domain/entities/player-quest.entity';
import type { PlayerQuestRepositoryPort } from 'src/modules/quest/domain/ports/player-quest-repository.port';
import type { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { PlayerQuestOrmEntity } from '../entities/player-quest-orm.entity';
import { PlayerQuestMapper } from '../mappers/player-quest.mapper';

@Injectable()
export class PlayerQuestRepository implements PlayerQuestRepositoryPort {
  constructor(
    @InjectRepository(PlayerQuestOrmEntity)
    private readonly playerQuestRepository: Repository<PlayerQuestOrmEntity>,
  ) {}

  public async save(playerQuest: PlayerQuest): Promise<void> {
    const persistence = PlayerQuestMapper.toPersistence(playerQuest);
    await this.playerQuestRepository.save(persistence);
  }

  public async findById(id: string): Promise<PlayerQuest | null> {
    const persistence = await this.playerQuestRepository.findOneBy({ id });
    return persistence ? PlayerQuestMapper.toDomain(persistence) : null;
  }

  public async findByCharacterId(characterId: string): Promise<PlayerQuest[]> {
    const persistences = await this.playerQuestRepository.findBy({ characterId });
    return persistences.map(PlayerQuestMapper.toDomain);
  }
}
