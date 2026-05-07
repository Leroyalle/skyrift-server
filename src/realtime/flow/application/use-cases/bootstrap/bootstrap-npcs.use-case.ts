import { NPC_READER_TOKEN, type NpcReaderPort } from 'src/modules/npc';
import { SPAWN_READER_FACADE_TOKEN, SpawnReaderFacadePort } from 'src/modules/spawn';
import {
  SPAWN_NPC_SESSION_USE_CASE_TOKEN,
  type SpawnNpcSessionUseCasePort,
} from 'src/realtime/npc-session';

import { Inject, Injectable } from '@nestjs/common';

import { assertCreatureHasInventory } from '../../lib/assert-creature-has-inventory.lib';
import { BootstrapNpcsMapper } from '../../mappers/bootstrap-npcs.mapper';
import { RuntimeEquipmentLoader } from '../../services/loaders/runtime-equipment-loader.service';

@Injectable()
export class BootstrapNpcsUseCase {
  constructor(
    @Inject(NPC_READER_TOKEN) private readonly npcReader: NpcReaderPort,
    @Inject(SPAWN_NPC_SESSION_USE_CASE_TOKEN)
    private readonly spawnNpcSessionUseCase: SpawnNpcSessionUseCasePort,
    @Inject(SPAWN_READER_FACADE_TOKEN) private readonly spawnReaderFacade: SpawnReaderFacadePort,
    private readonly runtimeEquipmentLoader: RuntimeEquipmentLoader,
  ) {}

  public async execute() {
    const npcs = await this.npcReader.findAll();

    for (const npc of npcs) {
      const spawn = await this.spawnReaderFacade.get(npc.spawnId);
      if (!spawn) throw new Error('Spawn is not found');
      assertCreatureHasInventory(npc);

      await this.runtimeEquipmentLoader.execute(npc.equipmentId);

      this.spawnNpcSessionUseCase.execute(BootstrapNpcsMapper.toProps(npc, spawn));
    }
  }
}
