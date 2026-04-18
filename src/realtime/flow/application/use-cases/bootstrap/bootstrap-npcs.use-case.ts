import { NPC_READER_TOKEN, type NpcReaderPort } from 'src/modules/npc';
import {
  SPAWN_NPC_SESSION_USE_CASE_TOKEN,
  type SpawnNpcSessionUseCasePort,
} from 'src/realtime/npc-session';

import { Inject, Injectable } from '@nestjs/common';

import { BootstrapNpcsMapper } from '../../mappers/bootstrap-npcs.mapper';

@Injectable()
export class BootstrapNpcsUseCase {
  constructor(
    @Inject(NPC_READER_TOKEN) private readonly npcReader: NpcReaderPort,
    @Inject(SPAWN_NPC_SESSION_USE_CASE_TOKEN)
    private readonly spawnNpcSessionUseCase: SpawnNpcSessionUseCasePort,
  ) {}

  public async execute() {
    const npcs = await this.npcReader.findAll();

    for (const npc of npcs) {
      this.spawnNpcSessionUseCase.execute(BootstrapNpcsMapper.toProps(npc));
    }
  }
}
