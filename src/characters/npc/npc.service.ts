import { Injectable } from '@nestjs/common';
import { Npc } from './entities/npc.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class NpcService {
  constructor(@InjectRepository(Npc) private readonly npcRepository: Repository<Npc>) {}

  public async create(npc: Omit<Npc, 'id'>) {
    return await this.npcRepository.save(npc);
  }
}
