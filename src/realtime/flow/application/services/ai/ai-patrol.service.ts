import { getRandomValue } from 'src/common/lib/get-random-value.lib';
import type { ILocation } from 'src/realtime/location';
import {
  MOB_SESSION_FACADE_TOKEN,
  type MobSessionFacadePort,
  type MobSessionSnapshot,
} from 'src/realtime/mob-session';
import { MOVEMENT_QUEUE_FACADE_TOKEN, type MovementQueueFacadePort } from 'src/realtime/movement';
import { PATH_FINDING_SERVICE, type PathFindingServicePort } from 'src/realtime/path-finding';
import { getTileByPosition } from 'src/realtime/shared/lib/helpers/get-tile-by-position.lib';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';
import { SPATIAL_GRID_INDEX_TOKEN, type SpatialGridIndexPort } from 'src/realtime/spatial-grid';

import { Inject, Injectable } from '@nestjs/common';

interface RangeArea extends IPositionTile {
  radius: number;
}

@Injectable()
export class AiPatrolService {
  constructor(
    @Inject(MOB_SESSION_FACADE_TOKEN) private readonly mobSessionFacade: MobSessionFacadePort,
    @Inject(PATH_FINDING_SERVICE) private pathFindingService: PathFindingServicePort,
    @Inject(MOVEMENT_QUEUE_FACADE_TOKEN)
    private readonly movementQueueFacade: MovementQueueFacadePort,
    @Inject(SPATIAL_GRID_INDEX_TOKEN) private readonly spatialGridService: SpatialGridIndexPort,
  ) {}

  public async execute(mob: MobSessionSnapshot, location: ILocation): Promise<void> {
    if (mob.state.current !== 'idle') return;

    const tilePosition = getTileByPosition(mob.position.x, mob.position.y, location.size.tileWidth);

    const nextTile = this.getRandomTileInRange(
      { x: mob.spawn.position.x, y: mob.spawn.position.y, radius: 5 },
      tilePosition,
      location,
    );

    const steps = await this.pathFindingService.getPath(
      mob.position.locationId,
      { x: tilePosition.x, y: tilePosition.y },
      { x: nextTile.x, y: nextTile.y },
      location.passableMap,
    );

    if (!steps || steps.length === 0) return;

    this.movementQueueFacade.set(mob, { steps });
    this.mobSessionFacade.setState(mob.id, {
      current: 'moving',
    });
  }

  private getRandomTileInRange(
    rangeArea: RangeArea,
    currentTile: IPositionTile,
    location: ILocation,
  ) {
    const { affectedCells } = this.spatialGridService.queryRadius(
      location.id,
      rangeArea.x,
      rangeArea.y,
      rangeArea.radius,
      null,
    );

    const uniqueTiles = affectedCells.filter(
      tile =>
        (tile.x !== currentTile.x || tile.y !== currentTile.y) &&
        location.passableMap?.[tile.y]?.[tile.x] === 1,
    );

    const tileIndex = getRandomValue(0, uniqueTiles.length - 1);

    return uniqueTiles[tileIndex];
  }
}
