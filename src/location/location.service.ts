import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { CachedLocation } from 'src/location/types/cashed-location.type';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { buildTeleportsMap } from './lib/build-teleports-map.lib';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly redisService: RedisService,
  ) {}

  private readonly locationCache = new Map<string, CachedLocation>();
  private readonly filenameToLocationId = new Map<string, string>();

  public async findAndCacheAll() {
    const findLocations = await this.locationRepository.find({
      relations: {
        mobSpawn: {
          mob: true,
          location: true,
        },
      },
    });

    const cachedLocations = await Promise.all(
      findLocations.map(async location => await this.setLocationToCache(location)),
    );

    return cachedLocations;
  }

  public async findOne(id: string) {
    return await this.locationRepository.findOne({
      where: { id },
    });
  }

  private async setLocationToCache(location: Location, saveToRedis: boolean = true) {
    const teleportsMap = buildTeleportsMap(location.tiledMap);
    const cachedLocation: CachedLocation = {
      ...location,
      teleportsMap,
    };
    this.locationCache.set(location.id, cachedLocation);
    this.filenameToLocationId.set(location.filename, location.id);
    if (saveToRedis) {
      await this.redisService.set(RedisKeys.Location + location.id, location);
    }

    return cachedLocation;
  }

  public async loadLocationByFilename(filename: string) {
    // FIXME: load location by filename and id when service is init
    // const locationId = this.filenameToLocationId.get(filename);

    // if (!locationId) return;

    const locationByFilename = await this.locationRepository.findOneBy({
      filename,
    });

    if (!locationByFilename) return;

    return await this.loadLocation(locationByFilename.id);
  }

  public async loadLocation(locationId: string): Promise<CachedLocation | undefined> {
    const cachedLocation = this.locationCache.get(locationId);

    if (cachedLocation) return cachedLocation;

    const redisLocation = await this.redisService.get<CachedLocation>(
      RedisKeys.Location + locationId,
    );

    if (redisLocation) {
      // const teleportsMap = buildTeleportsMap(redisLocation.tiledMap);
      // const locationInMemory = {
      //   ...redisLocation,
      //   teleportsMap,
      // };
      // this.locationCache.set(locationId, locationInMemory);
      // this.filenameToLocationId.set(redisLocation.filename, locationId);
      const cachedLocation = await this.setLocationToCache(redisLocation, false);
      return cachedLocation;
    }

    const dbLocation = await this.findOne(locationId);

    if (!dbLocation) return;

    // const teleportsMap = buildTeleportsMap(dbLocation.tiledMap);
    // const locationInMemory = {
    //   ...dbLocation,
    //   teleportsMap,
    // };

    // this.locationCache.set(locationId, locationInMemory);
    // this.filenameToLocationId.set(locationInMemory.filename, locationId);
    // await this.redisService.set(RedisKeys.Location + locationId, dbLocation);

    const savedLocation = await this.setLocationToCache(dbLocation);

    return savedLocation;
  }
}
