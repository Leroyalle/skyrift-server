import { PositionDto } from 'src/common/dto/position.dto';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { getRandomValue } from 'src/common/lib/get-random-value.lib';
import { isEntityCombatStatus } from 'src/game/lib/entity/is-entity-combat-status.lib';
import { getTileByPosition } from 'src/game/lib/helpers/get-tile-by-position.lib';
import { EntityRef } from 'src/game/types/entity/entity-ref.type';
import { LocationService } from 'src/world/location/location.service';
import { CachedLocation } from 'src/world/location/types/cashed-location.type';

import { forwardRef, Inject, Injectable } from '@nestjs/common';

import { CombatService } from '../../combat/combat.service';
import { EntityRegistryService } from '../../entity-registry/entity-registry.service';
import { MovementQueueService } from '../../movement/services/movement-queue/movement-queue.service';
import { PathFindingService } from '../../path-finding/path-finding.service';
import { SocketService } from '../../socket/socket.service';
import { SpatialGridService } from '../../spatial-grid/spatial-grid.service';
import { MobLootService } from '../mob/loot/mob-loot.service';

import { RangeArea } from './types/range-area.type';
import { IRuntimeMob } from './types/runtime-mob.type';

@Injectable()
export class RuntimeMobService {
  constructor(
    private readonly spatialGridService: SpatialGridService<IRuntimeMob>,
    private readonly locationService: LocationService,
    @Inject(forwardRef(() => CombatService))
    private readonly combatService: CombatService,
    private readonly pathFindingService: PathFindingService,
    private readonly movementQueueService: MovementQueueService,
    private readonly socketService: SocketService,
    private readonly registryService: EntityRegistryService,
    private readonly mobLootService: MobLootService,
  ) {}

  public async tickAiMobs() {
    const mobsEntries = this.registryService.mobsArray;

    for (const mob of mobsEntries) {
      const now = Date.now();
      if (!mob.isAlive) {
        if (mob.respawnIn && now >= mob.respawnIn) {
          this.respawn(mob.id);
        }
        continue;
      }

      if (mob.nextThinkAt && mob.nextThinkAt > now) continue;
      console.log('mob.isAlive ', mob.isAlive, ' mob.state ', mob.state);

      const currentMobPath = this.movementQueueService.get(mob);

      const currentPos = getTileByPosition(mob.x, mob.y, 32);
      const spawnPos = getTileByPosition(mob.spawnX, mob.spawnY, 32);

      if (currentPos.x === spawnPos.x && currentPos.y === spawnPos.y && mob.state === 'return') {
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
          await this.combatService.requestAttackMoveForMob(mob.id, mob.currentTarget.id);
          mob.state = 'pursue';
          continue;
        }
      }

      if (!mob.currentTarget && mob.state !== 'return' && mob.state !== 'pursue') {
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
    return oldTarget?.id !== newTarget?.id || oldTarget?.type !== newTarget?.type;
  }

  private checkVictimIsActual(runtimeMob: IRuntimeMob, victimRef: EntityRef): boolean {
    const victim = this.registryService.getByRef(victimRef);

    if (!victim) return false;

    if (!victim.isAlive) return false;

    return victim.locationId === runtimeMob.locationId;
  }

  private async patrol(mob: IRuntimeMob): Promise<void> {
    if (mob.state !== 'idle') return;

    const findLocation = await this.locationService.loadLocation(mob.locationId);

    if (!findLocation) return;

    const nextTile = this.getRandomTileInRange(
      { x: mob.spawnX, y: mob.spawnY, radius: 5 },
      { x: mob.x, y: mob.y },
      findLocation,
    );

    const mobTilePosition = getTileByPosition(mob.x, mob.y, findLocation.tileWidth);

    const path = await this.pathFindingService.getPlayerPath(
      mob.locationId,
      { x: mobTilePosition.x, y: mobTilePosition.y },
      { x: nextTile.x, y: nextTile.y },
      findLocation.passableMap,
    );

    if (!path || path.length === 0) return;

    this.movementQueueService.set(mob, path);
    mob.state = 'move';
  }

  private async hasExceededLeashDistance(runtimeMob: IRuntimeMob): Promise<boolean> {
    const findLocation = await this.locationService.loadLocation(runtimeMob.locationId);

    if (!findLocation) throw new Error('Location is not found');

    const currentPosition = getTileByPosition(runtimeMob.x, runtimeMob.y, findLocation.tileWidth);

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

    const actualResult = this.checkVictimIsActual(runtimeMob, runtimeMob.currentTarget);

    if (!actualResult) {
      this.returnMob(runtimeMob, path);
      return true;
    }

    return this.handleSwitchMobToReturnOrPursue(runtimeMob, path);
  }

  private handleSwitchMobToReturnOrPursue(mob: IRuntimeMob, path: PositionDto[]): boolean {
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
      tile => (tile.x !== tileX || tile.y !== tileY) && location.passableMap[tile.y][tile.x] === 1,
    );

    const tileIndex = getRandomValue(0, uniqueTiles.length - 1);

    return uniqueTiles[tileIndex];
  }

  public resetRespawnTime(runtimeMobId: string): IRuntimeMob | undefined {
    const spawnMob = this.registryService.getByRef({ type: 'mob', id: runtimeMobId });
    if (!spawnMob) return;
    spawnMob.respawnIn = null;
    return spawnMob;
  }

  public respawn(id: string) {
    const mob = this.resetRespawnTime(id);
    if (!mob) return;

    mob.hp = mob.maxHp;
    mob.isAlive = true;
    mob.state = 'idle';

    mob.aggro.clear();
    mob.currentTarget = null;

    mob.x = mob.spawnX;
    mob.y = mob.spawnY;

    this.spatialGridService.add(mob);

    this.socketService.sendTo(
      RedisKeys.Location + mob.locationId,
      ServerToClientEvents.RespawnMob,
      mob,
    );
  }

  public setRespawn(runtimeMobId: string) {
    const spawnMob = this.registryService.getByRef({ type: 'mob', id: runtimeMobId });

    if (!spawnMob) return;
    const now = Date.now();
    spawnMob.respawnIn = now + spawnMob.respawnTime;
  }

  public killMob(id: string) {
    const mob = this.registryService.getByRef({ type: 'mob', id });

    if (!mob) return;
    mob.isAlive = false;
    mob.state = 'dead';
    mob.aggro.clear();
    mob.currentTarget = null;

    const droppedLoot = this.mobLootService.generateLoot(mob.loot ?? []);

    this.spatialGridService.remove(mob);

    this.setRespawn(id);

    // console.log(, droppedLoot);
    console.log('DROPPPPPPPED LOOOOOOOOOOOT ', mob.loot);
    this.socketService.sendTo(RedisKeys.Location + mob.locationId, ServerToClientEvents.KillMob, {
      mob,
      loot: droppedLoot,
    });
  }
  public moveTo(runtimeMob: IRuntimeMob, to: PositionDto, now: number): IRuntimeMob {
    console.log(
      `[MOVE] Mob ${runtimeMob.name} (${runtimeMob.id}) from (${runtimeMob.x},${runtimeMob.y}) to (${to.x},${to.y}) state=${runtimeMob.state} isAlive=${runtimeMob.isAlive}`,
    );
    runtimeMob.x = to.x;
    runtimeMob.y = to.y;
    runtimeMob.lastMoveAt = now;
    return runtimeMob;
  }
}
