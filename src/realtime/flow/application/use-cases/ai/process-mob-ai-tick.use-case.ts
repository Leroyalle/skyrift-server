import { LOCATION_READER_TOKEN, type LocationReaderPort } from 'src/realtime/location';
import {
  MOB_SESSION_READER_TOKEN,
  type MobSessionReaderPort,
  type MobSessionSnapshot,
} from 'src/realtime/mob-session';
import { MOVEMENT_QUEUE_READER_TOKEN, type MovementQueueReaderPort } from 'src/realtime/movement';
import { CLOCK_TOKEN, type ClockPort } from 'src/realtime/shared/infrastructure/time';
import { getTileByPosition } from 'src/realtime/shared/lib/helpers/get-tile-by-position.lib';

import { Inject, Injectable } from '@nestjs/common';

import type { ProcessAiTickPort } from '../../ports/ai/process-ai-tick.port';
import { AiLeashService } from '../../services/ai/ai-leash.service';
import { AiLifecycleService } from '../../services/ai/ai-lifecycle.service';
import { AiPatrolService } from '../../services/ai/ai-patrol.service';
import { AiStateSyncService } from '../../services/ai/ai-state-sync.service';
import { AiTargetingService } from '../../services/ai/ai-targeting.service';

@Injectable()
export class ProcessAiTickUseCase implements ProcessAiTickPort {
  constructor(
    @Inject(MOB_SESSION_READER_TOKEN)
    private readonly mobSessionRepository: MobSessionReaderPort,
    @Inject(CLOCK_TOKEN) private readonly clockService: ClockPort,
    @Inject(MOVEMENT_QUEUE_READER_TOKEN)
    private readonly movementQueueReader: MovementQueueReaderPort,
    @Inject(LOCATION_READER_TOKEN) private readonly locationReader: LocationReaderPort,

    private readonly leash: AiLeashService,
    private readonly targeting: AiTargetingService,
    private readonly patrol: AiPatrolService,
    private readonly stateSync: AiStateSyncService,
    private readonly lifecycle: AiLifecycleService,
  ) {}

  public async execute(): Promise<void> {
    for (const mob of this.mobSessionRepository.getIterable()) {
      const now = this.clockService.nowMs();

      if (this.lifecycle.handleInactiveMob(mob, now)) continue;

      if (this.lifecycle.shouldSkipThink(mob, now)) continue;

      const { location, path, currentTile, spawnTile } = this.getRuntimeContext(mob);

      this.stateSync.normalizeIdleState(mob, currentTile, spawnTile, path);

      if (await this.leash.execute(mob, location, currentTile, spawnTile)) continue;

      if (await this.targeting.tryAttackAggroTarget(mob)) continue;

      if (await this.targeting.tryAttackNearbyPlayer(mob)) continue;

      await this.patrol.execute(mob, location);

      this.lifecycle.scheduleNextThink(mob, now);
    }
  }

  private getRuntimeContext(mob: MobSessionSnapshot) {
    const path = this.movementQueueReader.get({ id: mob.id, type: 'mob' });

    const location = this.locationReader.getById(mob.position.locationId);

    if (!location) throw new Error('Location is not found');

    const currentTile = getTileByPosition(mob.position.x, mob.position.y, location.size.tileWidth);
    const spawnTile = getTileByPosition(
      mob.spawn.position.x,
      mob.spawn.position.y,
      location.size.tileWidth,
    );

    return { path, location, currentTile, spawnTile };
  }
}
