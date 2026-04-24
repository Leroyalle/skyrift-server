import {
  BAG_CONTAINER_READER_TOKEN,
  type BagContainerReaderPort,
  EQUIPMENT_CONTAINER_FACADE_TOKEN,
  type EquipmentContainerFacadePort,
} from 'src/realtime/container';
import type { GameInitialData } from 'src/realtime/contracts/types/game-initial-data.type';
import { ENTITY_RESOLVER_TOKEN, type EntityResolverPort } from 'src/realtime/entity-registry';
import { SessionClientMapper } from 'src/realtime/shared/mappers/session-client.mapper';

import { Inject, Injectable } from '@nestjs/common';

import type { BuildLocationWorldStatePort } from '../../ports/build-location-world-state-use-case.port';
import type { BuildPlayerLocationStatePort } from '../../ports/initial-state/build-player-location-state.port';
import { BUILD_LOCATION_WORLD_STATE_USE_CASE_TOKEN } from '../../ports/tokens';

@Injectable()
export class BuildPlayerLocationStateUseCase implements BuildPlayerLocationStatePort {
  constructor(
    @Inject(BUILD_LOCATION_WORLD_STATE_USE_CASE_TOKEN)
    private readonly buildLocationWorldStateUseCase: BuildLocationWorldStatePort,
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(BAG_CONTAINER_READER_TOKEN) private readonly bagContainerReader: BagContainerReaderPort,
    @Inject(EQUIPMENT_CONTAINER_FACADE_TOKEN)
    private readonly equipmentFacade: EquipmentContainerFacadePort,
  ) {}

  public async execute(
    characterId: string,
    locationId: string,
  ): Promise<GameInitialData | undefined> {
    const locationResult = this.buildLocationWorldStateUseCase.execute(locationId);

    const player = this.entityResolver.getByRef({
      type: 'player',
      id: characterId,
    });

    if (!player) return;

    const playerSession = SessionClientMapper.mapPlayerSession(player);

    const bag = this.bagContainerReader.findById(player.bagId);

    if (!bag) return;

    const equipment = await this.equipmentFacade.getContainerById(player.equipmentId);

    if (!equipment) return;

    return {
      ...locationResult,
      player: playerSession,
      bag,
      equipment,
    };
  }
}
