import { Injectable } from '@nestjs/common';
import { CreateLocationInput } from './dto/create-location.input';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'src/redis/redis.service';
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

  create(createLocationInput: CreateLocationInput) {
    return 'This action adds a new location';
  }

  findAll() {
    return `This action returns all location`;
  }

  public async findOne(id: string) {
    return await this.locationRepository.findOne({
      where: { id },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} location`;
  }

  public async loadLocationByFilename(filename: string) {
    // const locationId = this.filenameToLocationId.get(filename);

    // if (!locationId) return;

    const locationByFilename = await this.locationRepository.findOneBy({
      filename,
    });

    if (!locationByFilename) return;

    return await this.loadLocation(locationByFilename.id);
  }

  public async loadLocation(
    locationId: string,
  ): Promise<CachedLocation | undefined> {
    const cachedLocation = this.locationCache.get(locationId);

    if (cachedLocation) return cachedLocation;

    const redisLocation = await this.redisService.get<CachedLocation>(
      RedisKeys.Location + locationId,
    );

    if (redisLocation) {
      const teleportsMap = buildTeleportsMap(redisLocation.tiledMap);
      const locationInMemory = {
        ...redisLocation,
        teleportsMap,
      };
      this.locationCache.set(locationId, locationInMemory);
      this.filenameToLocationId.set(redisLocation.filename, locationId);
      return redisLocation;
    }

    const dbLocation = await this.findOne(locationId);

    if (!dbLocation) return;

    const teleportsMap = buildTeleportsMap(dbLocation.tiledMap);
    const locationInMemory = {
      ...dbLocation,
      teleportsMap,
    };

    this.locationCache.set(locationId, locationInMemory);
    this.filenameToLocationId.set(locationInMemory.filename, locationId);
    await this.redisService.set(RedisKeys.Location + locationId, dbLocation);

    return locationInMemory;
  }
}
