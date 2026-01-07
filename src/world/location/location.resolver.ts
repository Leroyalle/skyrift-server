import { AccessTokenGuard } from 'src/common/guards/access-token.guard';

import { UseGuards } from '@nestjs/common';
import { Args, ID, Query, Resolver } from '@nestjs/graphql';

import { Location } from './entities/location.entity';
import { LocationService } from './location.service';

@UseGuards(AccessTokenGuard)
@Resolver(() => Location)
export class LocationResolver {
  constructor(private readonly locationService: LocationService) {}

  @Query(() => [Location], { name: 'location' })
  findAll() {
    return this.locationService.findAndCacheAll();
  }

  @Query(() => Location, { name: 'findLocationById' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.locationService.findOne(id);
  }
}
