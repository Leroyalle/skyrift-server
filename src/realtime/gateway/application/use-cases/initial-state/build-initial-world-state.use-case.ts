import type { SocketUserData } from 'src/infrastructure/ws';
import type { GameInitialData } from 'src/realtime/contracts/types/game-initial-data.type';
import {
  BUILD_LOCATION_WORLD_STATE_USE_CASE_TOKEN,
  type BuildLocationWorldStatePort,
} from 'src/realtime/flow';

import { Inject, Injectable } from '@nestjs/common';

import type { InitializePlayerSessionUseCase } from '../session/initialize-player-session.use-case';

@Injectable()
export class BuildInitialWorldStateUseCase {
  constructor(
    private readonly initializePlayerSessionUseCase: InitializePlayerSessionUseCase,
    @Inject(BUILD_LOCATION_WORLD_STATE_USE_CASE_TOKEN)
    private readonly buildLocationWorldStateUseCase: BuildLocationWorldStatePort,
  ) {}

  public async execute(payload: SocketUserData): Promise<GameInitialData> {
    const playerResult = await this.initializePlayerSessionUseCase.execute(payload);

    if (!playerResult) throw new Error('Player initialization failed');

    const locationResult = this.buildLocationWorldStateUseCase.execute(
      playerResult.player.position.locationId,
    );

    return {
      ...playerResult,
      ...locationResult,
    };
  }
}
