import { SOCKET_ADAPTER_TOKEN, type SocketAdapterPort } from 'src/infrastructure/ws';
import { RedisKeys } from 'src/realtime/contracts/constants/redis-keys.constant';
import { ServerToClientEvents } from 'src/realtime/contracts/constants/socket-events.constant';

import { Inject, Injectable } from '@nestjs/common';

import type {
  ChangePlayerLocationInput,
  ChangePlayerLocationPort,
} from '../../ports/change-player-location-use-case.port';
import type { PlayerLocationTransitionService } from '../../services/player-location-transition.service';
import type { BuildPlayerLocationStateUseCase } from '../initial-state/build-player-location-state.use-case';

@Injectable()
export class ChangePlayerLocationUseCase implements ChangePlayerLocationPort {
  constructor(
    @Inject(SOCKET_ADAPTER_TOKEN) private readonly socketAdapter: SocketAdapterPort,
    private readonly playerLocationTransitionService: PlayerLocationTransitionService,
    private readonly buildPlayerLocationStateUseCase: BuildPlayerLocationStateUseCase,
  ) {}

  public async execute(payload: ChangePlayerLocationInput) {
    await this.playerLocationTransitionService.execute(payload);

    const playerLocationState = await this.buildPlayerLocationStateUseCase.execute(
      payload.character.id,
      payload.targetLocationId,
    );

    if (!playerLocationState) throw new Error('Player location state not found');

    this.socketAdapter.sendToUser(
      playerLocationState.player.userId,
      ServerToClientEvents.PlayerChangeLocation,
      playerLocationState,
    );

    this.socketAdapter.broadcastToOthers(
      playerLocationState.player.userId,
      RedisKeys.Location + payload.targetLocationId,
      ServerToClientEvents.PlayerJoined,
      playerLocationState.player,
    );
  }
}
