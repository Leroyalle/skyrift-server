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
import { CachedLocation } from 'src/location/types/cashed-location.type';
import { RangeArea } from './types/range-area.type';
import { isEntityCombatStatus } from 'src/game/lib/entity/is-entity-combat-status.lib';
import { EntityRef } from 'src/game/types/entity/entity-ref.type';
import { RuntimeEntityService } from '../runtime-entity/runtime-entity.service';
import { MovementQueueService } from '../movement/services/movement-queue/movement-queue.service';

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
    private readonly runtimeEntityService: RuntimeEntityService,
    private readonly movementQueueService: MovementQueueService,
  ) {}

  private readonly mobsByLocation = new Map<string, Set<string>>();
  private readonly mobsById = new Map<string, IRuntimeMob>();

  public async onModuleInit() {
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

  public async tickAiMobs() {
    const mobsEntries = Array.from(this.mobsById.values());

    for (const mob of mobsEntries) {
      // console.log('[TICK_AI] mob state', mob.state);
      const now = Date.now();
      if (mob.respawnIn || mob.state === 'dead') {
        if (mob.respawnIn && now >= mob.respawnIn) {
          this.resetRespawnTime(mob.id);
        }

        continue;
      }

      if (mob.nextThinkAt && mob.nextThinkAt > now) continue;

      const currentMobPath = this.movementQueueService.get(mob);

      // const currentMobPath = this.movementService.getMovementQueue(
      //   mob.type,
      //   mob.id,
      // );

      const currentPos = getTileByPosition(mob.x, mob.y, 32);
      const spawnPos = getTileByPosition(mob.spawnX, mob.spawnY, 32);

      if (
        currentPos.x === spawnPos.x &&
        currentPos.y === spawnPos.y &&
        mob.state === 'return'
      ) {
        mob.state = 'idle';
      }

      if (
        (!currentMobPath || currentMobPath.steps.length === 0) &&
        !isEntityCombatStatus(mob.state)
      ) {
        mob.state = 'idle';
      }

      if (mob.state === 'pursue' || mob.state === 'attack') {
        const result = await this.hasExceededLeashDistance(mob);
        if (result) continue;
      }

      if (this.hasNewTarget(mob)) {
        mob.currentTarget = mob.aggro.getCurrentTarget;
        console.log('mob has new target', mob.currentTarget);
        if (mob.currentTarget) {
          console.log('mob has new target 2 before attack', mob.currentTarget);
          this.movementQueueService.delete(mob);
          // this.movementService.deleteMovementQueue(mob);
          await this.combatService.requestAttackMoveForMob(
            mob.id,
            mob.currentTarget.id,
          );
          mob.state = 'pursue';
          continue;
        }
      }

      if (
        !mob.currentTarget &&
        mob.state !== 'return' &&
        mob.state !== 'pursue'
      ) {
        const { entities } = this.spatialGridService.queryRadius(
          mob.locationId,
          mob.x,
          mob.y,
          mob.triggerRange,
          'player',
        );

        const target = entities?.[0];
        if (target) {
          this.movementQueueService.delete(mob);
          // this.movementService.deleteMovementQueue(mob);
          await this.combatService.requestAttackMoveForMob(mob.id, target.id);
          mob.state = 'pursue';
          continue;
        }
      }

      await this.patrol(mob);

      const randomDelay = getRandomValue(3000, 5000);
      mob.nextThinkAt = now + randomDelay;
    }
  }

  private hasNewTarget(mob: IRuntimeMob): boolean {
    const oldTarget = mob.currentTarget;
    const newTarget = mob.aggro.getCurrentTarget;
    return (
      oldTarget?.id !== newTarget?.id || oldTarget?.type !== newTarget?.type
    );
  }

  private checkVictimIsActual(
    runtimeMob: IRuntimeMob,
    victimRef: EntityRef,
  ): boolean {
    const victim = this.runtimeEntityService.getEntityByType(
      victimRef.type,
      victimRef.id,
    );

    if (!victim) return false;

    if (!victim.isAlive) return false;

    return victim.locationId === runtimeMob.locationId;
  }

  private async patrol(mob: IRuntimeMob): Promise<void> {
    if (mob.state !== 'idle') return;

    // console.log('[TICK_AI_MOBS], start patrol');

    const findLocation = await this.locationService.loadLocation(
      mob.locationId,
    );

    if (!findLocation) return;

    const nextTile = this.getRandomTileInRange(
      { x: mob.spawnX, y: mob.spawnY, radius: 5 },
      { x: mob.x, y: mob.y },
      findLocation,
    );

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

    this.movementQueueService.set(mob, path);
    // this.movementService.setMovementQueue(mob, path);
    mob.state = 'move';
  }

  private async hasExceededLeashDistance(
    runtimeMob: IRuntimeMob,
  ): Promise<boolean> {
    const findLocation = await this.locationService.loadLocation(
      runtimeMob.locationId,
    );

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
      throw new Error('path or current target not found');
    }

    if (!runtimeMob.currentTarget) {
      this.returnMob(runtimeMob, path);
      return true;
    }

    const actualResult = this.checkVictimIsActual(
      runtimeMob,
      runtimeMob.currentTarget,
    );

    if (!actualResult) {
      this.returnMob(runtimeMob, path);
      return true;
    }

    return this.handleSwitchMobToReturnOrPursue(runtimeMob, path);
  }

  private handleSwitchMobToReturnOrPursue(
    mob: IRuntimeMob,
    path: PositionDto[],
  ): boolean {
    if (path.length > 5) {
      this.returnMob(mob, path);
      return true;
    }
    mob.state = 'pursue';
    return false;
  }

  private returnMob(mob: IRuntimeMob, path: PositionDto[]): void {
    this.combatService.processRequestAttackCancel({
      type: mob.type,
      id: mob.id,
    });
    mob.currentTarget = mob.aggro.clear();
    mob.state = 'return';
    this.movementQueueService.set(mob, path);
    // this.movementService.setMovementQueue(mob, path);
  }

  public get mobsArray() {
    return Array.from(this.mobsById.values());
  }

  public getById(id: string) {
    return this.mobsById.get(id);
  }

  private getRandomTileInRange(
    rangeArea: RangeArea,
    currentTile: PositionDto,
    location: CachedLocation,
  ) {
    const { affectedCells } = this.spatialGridService.queryRadius(
      location.id,
      rangeArea.x,
      rangeArea.y,
      rangeArea.radius,
    );

    const { x: tileX, y: tileY } = getTileByPosition(
      currentTile.x,
      currentTile.y,
      location.tileWidth,
    );

    const uniqueTiles = affectedCells.filter(
      (tile) =>
        (tile.x !== tileX || tile.y !== tileY) &&
        location.passableMap[tile.y][tile.x] === 1,
    );

    const tileIndex = getRandomValue(0, uniqueTiles.length - 1);

    return uniqueTiles[tileIndex];
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
