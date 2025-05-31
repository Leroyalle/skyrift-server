import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { LocationService } from './location.service';
import { Location } from './entities/location.entity';
import { CreateLocationInput } from './dto/create-location.input';
import { UpdateLocationInput } from './dto/update-location.input';
import { UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';

@UseGuards(AccessTokenGuard)
@Resolver(() => Location)
export class LocationResolver {
  constructor(private readonly locationService: LocationService) {}

  @Mutation(() => Location)
  createLocation(
    @Args('createLocationInput') createLocationInput: CreateLocationInput,
  ) {
    return this.locationService.create(createLocationInput);
  }

  @Query(() => [Location], { name: 'location' })
  findAll() {
    return this.locationService.findAll();
  }

  @Query(() => Location, { name: 'findLocationById' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.locationService.findOne(id);
  }

  @Mutation(() => Location)
  updateLocation(
    @Args('updateLocationInput') updateLocationInput: UpdateLocationInput,
  ) {
    return this.locationService.update(
      updateLocationInput.id,
      updateLocationInput,
    );
  }

  @Mutation(() => Location)
  removeLocation(@Args('id', { type: () => Int }) id: number) {
    return this.locationService.remove(id);
  }
}
