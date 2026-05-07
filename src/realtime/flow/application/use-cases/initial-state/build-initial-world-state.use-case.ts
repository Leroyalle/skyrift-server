import type { SocketUserData } from 'src/infrastructure/ws';
import type { GameInitialData } from 'src/realtime/contracts/types/game-initial-data.type';

import { Inject, Injectable } from '@nestjs/common';

import { BuildInitialWorldStatePort } from '../../ports/build-initial-world-state.port';
import type { BuildLocationWorldStatePort } from '../../ports/build-location-world-state-use-case.port';
import { BUILD_LOCATION_WORLD_STATE_USE_CASE_TOKEN } from '../../ports/tokens';
import { InitializePlayerSessionUseCase } from '../session/initialize-player-session.use-case';

@Injectable()
export class BuildInitialWorldStateUseCase implements BuildInitialWorldStatePort {
  constructor(
    private readonly initializePlayerSessionUseCase: InitializePlayerSessionUseCase,
    @Inject(BUILD_LOCATION_WORLD_STATE_USE_CASE_TOKEN)
    private readonly buildLocationWorldStateUseCase: BuildLocationWorldStatePort,
  ) {}

  public async execute(payload: SocketUserData): Promise<GameInitialData> {
    const playerResult = await this.initializePlayerSessionUseCase.execute(payload);

    if (!playerResult) throw new Error('Player initialization failed');

    const locationResult = await this.buildLocationWorldStateUseCase.execute(
      playerResult.player.position.locationId,
    );

    return {
      ...playerResult,
      ...locationResult,
    };
  }
}
