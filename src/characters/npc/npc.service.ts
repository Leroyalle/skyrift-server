import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Npc } from './entities/npc.entity';

@Injectable()
export class NpcService {
  constructor(@InjectRepository(Npc) private readonly npcRepository: Repository<Npc>) {}

  public async create(npc: Omit<Npc, 'id'>) {
    return await this.npcRepository.save(npc);
  }
}
