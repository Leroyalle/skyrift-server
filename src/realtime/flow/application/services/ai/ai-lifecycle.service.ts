import { getRandomValue } from 'src/common/lib/get-random-value.lib';
import { SOCKET_ADAPTER_TOKEN, type SocketAdapterPort } from 'src/infrastructure/ws';
import { ServerToClientEvents } from 'src/realtime/contracts/constants/socket-events.constant';
import { SocketKeys } from 'src/realtime/contracts/constants/socket-keys.constant';
import {
  MOB_SESSION_FACADE_TOKEN,
  type MobSessionFacadePort,
  type MobSessionSnapshot,
} from 'src/realtime/mob-session';

import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AiLifecycleService {
  constructor(
    @Inject(SOCKET_ADAPTER_TOKEN) private readonly socketAdapter: SocketAdapterPort,
    @Inject(MOB_SESSION_FACADE_TOKEN) private readonly mobSessionFacade: MobSessionFacadePort,
  ) {}

  public handleInactiveMob(mob: MobSessionSnapshot, now: number): boolean {
    const hasPendingRespawn = mob.lifecycle.respawnIn > 0;

    if (!hasPendingRespawn && mob.state.current !== 'dead') return false;

    if (hasPendingRespawn && now < mob.lifecycle.respawnIn) return false;

    this.respawn(mob);

    return true;
  }

  private respawn(mob: MobSessionSnapshot) {
    this.mobSessionFacade.respawn(mob.id);
    this.socketAdapter.sendTo(
      SocketKeys.Location + mob.position.locationId,
      ServerToClientEvents.RespawnMob,
      { id: mob.id },
    );
  }

  public scheduleNextThink(mob: MobSessionSnapshot, now: number) {
    const randomDelay = getRandomValue(3000, 5000);
    this.mobSessionFacade.scheduleNextThinkAt(mob.id, now, randomDelay);
  }

  public shouldSkipThink(mob: MobSessionSnapshot, now: number): boolean {
    return !!mob.lifecycle.nextThinkAt && mob.lifecycle.nextThinkAt > now;
  }
}
