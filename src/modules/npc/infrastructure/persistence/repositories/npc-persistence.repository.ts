import type { NpcRepositoryPort } from 'src/modules/npc/domain/ports/npc-repository.port';
import type { INpc } from 'src/modules/npc/domain/types/npc.type';
import type { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { NpcOrmEntity } from '../entities/npc-orm.entity';

@Injectable()
export class NpcPersistenceRepository implements NpcRepositoryPort {
  constructor(
    @InjectRepository(NpcOrmEntity) private readonly repository: Repository<NpcOrmEntity>,
  ) {}

  public async save(npc: INpc): Promise<void> {
    await this.repository.save(npc);
  }

  public async findById(id: string): Promise<INpc | null> {
    return this.repository.findOneBy({ id });
  }

  public async findByLocationId(locationId: string): Promise<INpc[]> {
    return this.repository.findBy({ locationId });
  }

  public async remove(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  public async update(npc: INpc): Promise<void> {
    await this.repository.save(npc);
  }
}
