import { Inject, Injectable } from '@nestjs/common';

import type { NpcRepositoryPort } from '../../domain/ports/npc-repository.port';
import type { INpc } from '../../domain/types/npc.type';
import type { NpcReaderPort } from '../ports/npc-reader.port';
import { NPC_PERSISTENCE_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class NpcReader implements NpcReaderPort {
  constructor(
    @Inject(NPC_PERSISTENCE_REPOSITORY_TOKEN) private readonly npcRepository: NpcRepositoryPort,
  ) {}

  public async findById(id: string): Promise<INpc | null> {
    return this.npcRepository.findById(id);
  }

  public async findByLocationId(locationId: string): Promise<INpc[]> {
    return this.npcRepository.findByLocationId(locationId);
  }

  public findAll(): Promise<INpc[]> {
    return this.npcRepository.findAll();
  }
}
