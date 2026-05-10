import { SOCKET_ADAPTER_TOKEN, type SocketAdapterPort } from 'src/infrastructure/ws';
import { RedisKeys } from 'src/realtime/contracts/constants/redis-keys.constant';
import { ServerToClientEvents } from 'src/realtime/contracts/constants/socket-events.constant';
import {
  ENTITY_ACTION_FACADE_TOKEN,
  ENTITY_RESOLVER_TOKEN,
  type EntityActionFacadePort,
  type EntityResolverPort,
} from 'src/realtime/entity-registry';
import { CLOCK_TOKEN, type ClockPort } from 'src/realtime/shared/infrastructure/time';
import { getOrCreate } from 'src/realtime/shared/lib/helpers/get-or-create-array.lib';

import { Inject, Injectable } from '@nestjs/common';

import type { ProcessRecoveryTickPort } from '../ports/process-recovery-tick.port';
import type { BatchUpdateRegeneration } from '../types/batch-update-regeneration.type';

@Injectable()
export class ProcessRecoveryTickUseCase implements ProcessRecoveryTickPort {
  constructor(
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(CLOCK_TOKEN) private readonly clockService: ClockPort,
    @Inject(ENTITY_ACTION_FACADE_TOKEN) private readonly entityActionFacade: EntityActionFacadePort,
    @Inject(SOCKET_ADAPTER_TOKEN) private readonly socketAdapter: SocketAdapterPort,
  ) {}

  public execute() {
    const updatesByLocation = new Map<string, BatchUpdateRegeneration[]>();
    const now = this.clockService.nowMs();
    this.processPlayers(updatesByLocation, now);
    this.processMobs(updatesByLocation, now);
    this.sendBatch(updatesByLocation);
  }

  private sendBatch(batch: Map<string, BatchUpdateRegeneration[]>) {
    for (const [locationId, updates] of batch.entries()) {
      this.socketAdapter.sendTo(
        RedisKeys.Location + locationId,
        ServerToClientEvents.PlayerResourcesBatch,
        updates,
      );
    }
  }

  private processPlayers(updatesByLocation: Map<string, BatchUpdateRegeneration[]>, now: number) {
    for (const player of this.entityResolver.getIterable('player')) {
      if (now - player.combat.lastHpRegenerationTime < 5000) return;
      if (player.combat.hp >= player.baseStats.maxHp || !player.combat.isAlive) return;
      const hpDelta = 100;
      const restoredHp = this.entityActionFacade.restoreHp(player, hpDelta, now);

      if (!restoredHp) continue;

      const locationBatch = getOrCreate(updatesByLocation, player.position.locationId, () => []);
      locationBatch.push({
        id: player.id,
        type: 'player',
        hp: restoredHp,
        hpDelta,
      });
    }
  }

  private processMobs(updatesByLocation: Map<string, BatchUpdateRegeneration[]>, now: number) {
    for (const player of this.entityResolver.getIterable('mob')) {
      if (now - player.combat.lastHpRegenerationTime < 5000) return;
      if (player.combat.hp >= player.baseStats.maxHp || !player.combat.isAlive) return;
      const hpDelta = 100;
      const restoredHp = this.entityActionFacade.restoreHp(player, hpDelta, now);

      if (!restoredHp) continue;

      const locationBatch = getOrCreate(updatesByLocation, player.position.locationId, () => []);
      locationBatch.push({
        id: player.id,
        type: 'player',
        hp: restoredHp,
        hpDelta,
      });
    }
  }
}
