import { ENTITY_RESOLVER_TOKEN, type EntityResolverPort } from 'src/realtime/entity-registry';
import { LOCATION_READER_TOKEN, type LocationReaderPort } from 'src/realtime/location';
import { PLAN_MOVEMENT_USE_CASE_TOKEN, type PlanMovementUseCasePort } from 'src/realtime/movement';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import { Inject, Injectable } from '@nestjs/common';

import type { SocketUserData } from '../../ports/socket-adapter.port';

interface Payload extends SocketUserData {
  targetTile: IPositionTile;
}

@Injectable()
export class RequestMoveUseCase {
  constructor(
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(PLAN_MOVEMENT_USE_CASE_TOKEN)
    private readonly planMovementUseCase: PlanMovementUseCasePort,
    @Inject(LOCATION_READER_TOKEN) private readonly locationReader: LocationReaderPort,
  ) {}

  public async execute(payload: Payload) {
    const character = this.entityResolver.getByRef({
      id: payload.characterId,
      type: 'player',
    });

    if (!character) throw new Error('Character not found');

    const location = this.locationReader.getById(character.position.locationId);

    if (!location) throw new Error('Location not found');

    await this.planMovementUseCase.execute({
      entity: { characterId: character.id, position: character.position },
      location: {
        tileHeight: location.size.tileHeight,
        tileWidth: location.size.tileWidth,
        passableMap: location.passableMap,
        id: location.id,
      },
      targetTile: payload.targetTile,
    });
  }
}
