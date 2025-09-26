import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { LocationService } from 'src/location/location.service';
import { IRuntimeMob } from './types/runtime-mob.type';
import { PositionDto } from 'src/common/dto/position.dto';
import { getTileByPosition } from 'src/game/lib/get-tile-by-position.lib';
import { SpatialGridService } from '../spatial-grid/spatial-grid.service';
import { CombatService } from '../combat/combat.service';
import { PathFindingService } from '../path-finding/path-finding.service';
import { MovementService } from '../movement/movement.service';
import { buildRuntimeMob } from './lib/build-runtime-mob.lib';

@Injectable()
export class RuntimeMobService implements OnModuleInit {
  constructor(
    private readonly spatialGridService: SpatialGridService<IRuntimeMob>,
    private readonly locationService: LocationService,
    @Inject(forwardRef(() => CombatService))
    private readonly combatService: CombatService,
    private readonly pathFindingService: PathFindingService,
    @Inject(forwardRef(() => MovementService))
    private readonly movementService: MovementService,
  ) {}

  private readonly mobsByLocation = new Map<string, Set<string>>();
  private readonly mobsById = new Map<string, IRuntimeMob>();

  async onModuleInit() {
    const locations = await this.locationService.findAndCacheAll();
    for (const location of locations) {
      const mobsSet = this.getOrCreateActiveMobsLocationMap(location.id);
      location.mobSpawn.forEach((mobSpawn) => {
        const runtimeMob = buildRuntimeMob(mobSpawn);
        mobsSet.add(runtimeMob.id);
        this.mobsById.set(runtimeMob.id, runtimeMob);
        this.spatialGridService.add(runtimeMob);
      });
    }
  }

  async tickAiMobs() {
    const mobsEntries = Array.from(this.mobsById.values());

    for (const runtimeMob of mobsEntries) {
      if (runtimeMob.respawnIn) continue;

      if (runtimeMob.currentTarget) {
        const findLocation = await this.locationService.loadLocation(
          runtimeMob.locationId,
        );

        if (!findLocation) continue;

        const currentPosition = getTileByPosition(
          runtimeMob.x,
          runtimeMob.y,
          findLocation.tileWidth,
        );

        const spawnPosition = getTileByPosition(
          runtimeMob.spawnX,
          runtimeMob.spawnY,
          findLocation.tileWidth,
        );

        const path = await this.pathFindingService.getPlayerPath(
          runtimeMob.locationId,
          spawnPosition,
          currentPosition,
          findLocation.passableMap,
        );

        // TODO: если дистанция равна -1 по каким-то причинам (баг), тогда деспавним моба

        if (path.length > 5) {
          this.movementService.setMovementQueue(runtimeMob, path);
          runtimeMob.currentTarget = null;
          runtimeMob.state = 'return';
          continue;
        }
      }

      const { entities } = this.spatialGridService.queryRadius(
        runtimeMob.locationId,
        runtimeMob.x,
        runtimeMob.y,
        runtimeMob.triggerRange,
      );

      const target = entities.find((ent) => ent.type === 'player');

      if (!target) continue;

      await this.combatService.requestAttackMoveForMob(
        runtimeMob.id,
        target.id,
      );
    }
  }

  get mobsArray() {
    return Array.from(this.mobsById.entries());
  }

  public getById(spawnMobId: string) {
    return this.mobsById.get(spawnMobId);
  }

  getRandomTileInArea(runtimeMob: IRuntimeMob, tileSize: number) {
    const { x: tileX, y: tileY } = getTileByPosition(
      runtimeMob.x,
      runtimeMob.y,
      tileSize,
    );

    const minX = tileX - runtimeMob.areaRadius;
    const maxX = tileX + runtimeMob.areaRadius;
    const minY = tileY - runtimeMob.areaRadius;
    const maxY = tileY + runtimeMob.areaRadius;

    const tiles: PositionDto[] = [];
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        tiles.push({ x, y });
      }
    }

    const uniqueTiles = tiles.filter(
      (tile) => tile.x !== tileX && tile.y !== tileY,
    );

    const randomTileIndex = Math.floor(Math.random() * uniqueTiles.length);

    return uniqueTiles[randomTileIndex];
  }

  private getOrCreateActiveMobsLocationMap(locationId: string): Set<string> {
    let mobsSet = this.mobsByLocation.get(locationId);
    if (!mobsSet) {
      mobsSet = new Set();
      this.mobsByLocation.set(locationId, mobsSet);
    }
    return mobsSet;
  }

  public resetRespawnTime(runtimeMobId: string) {
    const spawnMob = this.mobsById.get(runtimeMobId);
    if (!spawnMob) return;
    spawnMob.respawnIn = null;
  }

  public setRespawn(runtimeMobId: string) {
    const spawnMob = this.mobsById.get(runtimeMobId);
    if (!spawnMob) return;
    const now = Date.now();
    spawnMob.respawnIn = now + spawnMob.respawnTime;
  }

  public moveTo(
    runtimeMob: IRuntimeMob,
    to: PositionDto,
    now: number,
  ): IRuntimeMob {
    runtimeMob.x = to.x;
    runtimeMob.y = to.y;
    runtimeMob.lastMoveAt = now;
    return runtimeMob;
  }
}
