import { Injectable } from '@nestjs/common';
import { CreateLocationInput } from './dto/create-location.input';
import { Repository } from 'typeorm';
import { Location } from './entities/location.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RedisService } from 'src/redis/redis.service';
import { CachedLocation } from 'src/location/types/cashed-location.type';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly redisService: RedisService,
  ) {}

  private readonly locationCache = new Map<string, CachedLocation>();

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

  public async loadLocation(locationId: string) {
    const cachedLocation = this.locationCache.get(locationId);

    if (cachedLocation) return cachedLocation;

    const redisLocation = await this.redisService.get<CachedLocation>(
      RedisKeys.Location + locationId,
    );

    if (redisLocation) {
      this.locationCache.set(locationId, redisLocation);
      return redisLocation;
    }

    const dbLocation = await this.findOne(locationId);

    if (!dbLocation) return;

    this.locationCache.set(locationId, dbLocation);
    await this.redisService.set(RedisKeys.Location + locationId, dbLocation);

    return dbLocation;
  }
}
