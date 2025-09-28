import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { LocationService } from 'src/location/location.service';
import { IRuntimeMob } from './types/runtime-mob.type';
import { PositionDto } from 'src/common/dto/position.dto';
import { getTileByPosition } from 'src/game/lib/helpers/get-tile-by-position.lib';
import { SpatialGridService } from '../spatial-grid/spatial-grid.service';
import { CombatService } from '../combat/combat.service';
import { PathFindingService } from '../path-finding/path-finding.service';
import { MovementService } from '../movement/movement.service';
import { buildRuntimeMob } from './lib/build-runtime-mob.lib';
import { getRandomValue } from 'src/common/lib/get-random-value.lib';

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

  public getMobsByLocation(locationId: string): IRuntimeMob[] {
    const mobsIds = this.mobsByLocation.get(locationId) ?? [];
    const mobs: IRuntimeMob[] = [];
    for (const mId of mobsIds.values()) {
      const mob = this.getById(mId);
      if (!mob) continue;
      mobs.push(mob);
    }
    return mobs;
  }

  // TODO: добавить в главный тик   + пересмотри полностбю логику
  // делать паузу между патрулями
  async tickAiMobs() {
    const mobsEntries = Array.from(this.mobsById.values());

    for (const runtimeMob of mobsEntries) {
      if (runtimeMob.respawnIn) continue;

      const now = Date.now();

      if (runtimeMob.nextThinkAt && runtimeMob.nextThinkAt > now) continue;

      const currentMobPath = this.movementService.getMovementQueue(
        runtimeMob.type,
        runtimeMob.id,
      );

      if (!currentMobPath || currentMobPath.steps.length === 0) {
        runtimeMob.state = 'idle';
      }

      if (runtimeMob.currentTarget) {
        const result = await this.hasExceededLeashDistance(runtimeMob);
        if (result) continue;
      }

      const { entities } = this.spatialGridService.queryRadius(
        runtimeMob.locationId,
        runtimeMob.x,
        runtimeMob.y,
        runtimeMob.triggerRange,
      );

      const target = entities.find((ent) => ent.type === 'player');

      if (target && !runtimeMob.currentTarget) {
        await this.combatService.requestAttackMoveForMob(
          runtimeMob.id,
          target.id,
        );
        continue;
      }

      await this.patrol(runtimeMob);

      const randomDelay = getRandomValue(3000, 6000);
      runtimeMob.nextThinkAt = now + randomDelay;
    }
  }

  private async patrol(mob: IRuntimeMob): Promise<void> {
    if (mob.state !== 'idle') return;

    const findLocation = await this.locationService.loadLocation(
      mob.locationId,
    );

    if (!findLocation) return;

    const nextTile = this.getRandomTileInRange(mob, findLocation.tileWidth);

    console.log({ x: mob.x, y: mob.y }, { x: nextTile.x, y: nextTile.y });

    const mobTilePosition = getTileByPosition(
      mob.x,
      mob.y,
      findLocation.tileWidth,
    );

    const path = await this.pathFindingService.getPlayerPath(
      mob.locationId,
      { x: mobTilePosition.x, y: mobTilePosition.y },
      { x: nextTile.x, y: nextTile.y },
      findLocation.passableMap,
    );

    if (!path || path.length === 0) return;

    this.movementService.setMovementQueue(mob, path);
    mob.state = 'move';
  }

  private async hasExceededLeashDistance(
    runtimeMob: IRuntimeMob,
  ): Promise<boolean> {
    const findLocation = await this.locationService.loadLocation(
      runtimeMob.locationId,
    );

    // TODO: деспавнить моба и слать клиенту ошибку в try/catch
    if (!findLocation) throw new Error('Location is not found');

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
      currentPosition,
      spawnPosition,
      findLocation.passableMap,
    );

    if (!path) {
      throw new Error('path not found');
    }

    // TODO: если дистанция равна -1 по каким-то причинам (баг), тогда деспавним моба

    return this.handleSwitchMobToReturnOrPursue(runtimeMob, path);
  }

  private handleSwitchMobToReturnOrPursue(
    mob: IRuntimeMob,
    path: PositionDto[],
  ): boolean {
    if (path.length > 5) {
      this.combatService.clearPendingActions({ id: mob.id, type: mob.type });
      mob.currentTarget = null;
      this.movementService.setMovementQueue(mob, path);
      mob.state = 'return';
      return true;
    }

    mob.state = 'pursue';
    return false;
  }

  get mobsArray() {
    return Array.from(this.mobsById.entries());
  }

  public getById(spawnMobId: string) {
    return this.mobsById.get(spawnMobId);
  }

  private getRandomTileInRange(mob: IRuntimeMob, tileSize: number) {
    console.log('INPUT', mob.locationId, mob.x, mob.y, mob.triggerRange);
    const { affectedCells } = this.spatialGridService.queryRadius(
      mob.locationId,
      mob.spawnX,
      mob.spawnY,
      5, // TODO: перенести в отдельное поле в бд моба
    );

    console.log(affectedCells);

    // const { x: tileX, y: tileY } = getTileByPosition(mob.x, mob.y, tileSize);

    // const uniqueTiles = affectedCells.filter(
    //   (tile) => tile.x !== tileX || tile.y !== tileY,
    // );

    const tileIndex = getRandomValue(0, affectedCells.length - 1);

    return affectedCells[tileIndex];
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
