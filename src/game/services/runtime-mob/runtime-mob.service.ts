import { Injectable, OnModuleInit } from '@nestjs/common';
import { LocationService } from 'src/location/location.service';
import { MobSpawn } from 'src/mob/mob-spawn/entities/mob-spawn.entity';
import { MobSpawnService } from 'src/mob/mob-spawn/mob-spawn.service';
import { MobService } from 'src/mob/mob.service';
import { RuntimeMob } from './types/runtime-mob.type';
import { PositionDto } from 'src/common/dto/position.dto';
import { getTileByPosition } from 'src/game/lib/get-tile-by-position.lib';

@Injectable()
export class RuntimeMobService implements OnModuleInit {
  constructor(
    private readonly mobService: MobService,
    private readonly mobSpawnService: MobSpawnService,
    private readonly locationService: LocationService,
  ) {}

  private readonly mobsByLocation = new Map<string, Set<string>>();
  private readonly mobsById = new Map<string, RuntimeMob>();

  async onModuleInit() {
    const locations = await this.locationService.findAndCacheAll();
    for (const location of locations) {
      const mobsSet = this.getOrCreateActiveMobsLocationMap(location.id);
      location.mobSpawn.forEach((mobSpawn) => {
        const runtimeMob = this.buildRuntimeMob(mobSpawn);
        mobsSet.add(mobSpawn.id);
        this.mobsById.set(mobSpawn.id, runtimeMob);
      });
    }
  }

  get mobsArray() {
    return Array.from(this.mobsById.entries());
  }

  public getById(spawnMobId: string) {
    return this.mobsById.get(spawnMobId);
  }

  getRandomTileInArea(runtimeMob: RuntimeMob, tileSize: number) {
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

  private buildRuntimeMob(mobSpawn: MobSpawn): RuntimeMob {
    if (!mobSpawn.mob) throw new Error('Mob is not loaded in spawn!');
    const { location: _, ...mobSpawnStats } = mobSpawn;
    return {
      ...mobSpawnStats,
      locationId: mobSpawn.location.id,
      type: 'mob',
      mob: {
        ...mobSpawn.mob,
        x: mobSpawn.x,
        y: mobSpawn.y,
        isInSpawnArea: true,
        lastMoveAt: 123123,
        lastDirection: 'down',
        lastAttackAt: 3423,
        respawnIn: null,
        currentPath: null,
        currentTarget: null,
        isAttacking: false,
      },
    };
  }

  public resetRespawnTime(locationId: string, spawnMobId: string) {
    const spawnMob = this.mobsById.get(spawnMobId);
    if (!spawnMob) return;
    spawnMob.mob.respawnIn = null;
  }

  public setRespawn(locationId: string, spawnMobId: string) {
    const spawnMob = this.mobsById.get(spawnMobId);
    if (!spawnMob) return;
    const now = Date.now();
    spawnMob.mob.respawnIn = now + spawnMob.mob.respawnTime;
  }

  public moveTo(
    runtimeMob: RuntimeMob,
    to: PositionDto,
    now: number,
  ): RuntimeMob {
    runtimeMob.mob.x = to.x;
    runtimeMob.mob.y = to.y;
    runtimeMob.mob.lastMoveAt = now;
    return runtimeMob;
  }
}
