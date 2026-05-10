import {
  CHANGE_PLAYER_LOCATION_USE_CASE_TOKEN,
  type ChangePlayerLocationPort,
} from 'src/realtime/flow';
import {
  type ILocation,
  LOCATION_READER_TOKEN,
  type LocationReaderPort,
  type Teleport,
} from 'src/realtime/location';
import {
  APPROACH_TARGET_SERVICE_TOKEN,
  type ApproachTargetServicePort,
} from 'src/realtime/movement';
import { type PlayerSessionSnapshot } from 'src/realtime/player-session';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import { Inject, Injectable } from '@nestjs/common';

import { isPlayerInTeleportArea } from '../../domain/lib/is-player-in-teleport-radius.lib';

@Injectable()
export class TeleportInteractionService {
  constructor(
    @Inject(APPROACH_TARGET_SERVICE_TOKEN)
    private readonly approachTargetService: ApproachTargetServicePort,
    @Inject(LOCATION_READER_TOKEN) private readonly locationReader: LocationReaderPort,
    @Inject(CHANGE_PLAYER_LOCATION_USE_CASE_TOKEN)
    private readonly changePlayerLocationUseCase: ChangePlayerLocationPort,
  ) {}

  public async execute(
    character: PlayerSessionSnapshot,
    location: ILocation,
    teleport: Teleport,
    interaction: { area: IPositionTile },
  ): Promise<void> {
    const targetLocation = this.locationReader.getByFilename(teleport.targetMap);

    if (!targetLocation) return;

    if (isPlayerInTeleportArea(character, teleport)) {
      await this.changePlayerLocationUseCase.execute({
        character,
        targetLocationId: targetLocation.id,
        targetX: teleport.targetX,
        targetY: teleport.targetY,
      });

      return;
    } else {
      await this.approachTargetService.execute({
        actor: character,
        target: { position: interaction.area },
        location,
      });
      return;
    }
  }
}
