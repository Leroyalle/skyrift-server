import { ENTITY_RESOLVER_TOKEN, type EntityResolverPort } from 'src/realtime/entity-registry';
import { LOCATION_READER_TOKEN, type LocationReaderPort } from 'src/realtime/location';
import {
  APPROACH_TARGET_SERVICE_TOKEN,
  type ApproachTargetServicePort,
} from 'src/realtime/movement';

import { Inject, Injectable } from '@nestjs/common';

import { isPlayerInTeleportArea } from '../../domain/lib/is-player-in-teleport-radius.lib';
import type { InteractionRepositoryPort } from '../../domain/ports/interaction-repository.port';
import type {
  RequestUseTeleportPayload,
  RequestUseTeleportPort,
} from '../ports/request-use-teleport.port';
import { INTERACTION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class RequestUseTeleportUseCase implements RequestUseTeleportPort {
  constructor(
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(LOCATION_READER_TOKEN) private readonly locationReader: LocationReaderPort,
    @Inject(APPROACH_TARGET_SERVICE_TOKEN)
    private readonly approachTargetService: ApproachTargetServicePort,
    @Inject(INTERACTION_REPOSITORY_TOKEN)
    private readonly interactionRepository: InteractionRepositoryPort,
  ) {}

  public async execute(payload: RequestUseTeleportPayload) {
    const character = this.entityResolver.getByRef({ type: 'player', id: payload.characterId });

    if (!character) throw new Error('Character not found');

    const location = this.locationReader.getById(character.position.locationId);

    if (!location) throw new Error('Location not found');

    const teleport = location.teleportsMap[payload.teleportId];

    if (!teleport) throw new Error('Teleport not found');

    if (isPlayerInTeleportArea(character, teleport)) {
      this.interactionRepository.add({
        characterId: payload.characterId,
        type: 'teleport',
        targetId: payload.teleportId,
        area: { x: payload.pointerX, y: payload.pointerY },
      });
    } else {
      await this.approachTargetService.execute({
        actor: character,
        target: {
          position: {
            x: payload.pointerX,
            y: payload.pointerY,
          },
        },
        location,
      });
      return;
    }
  }
}
