import { Args, Int, Query, Resolver } from '@nestjs/graphql';

import { BagService } from './bag.service';
import { Bag } from './entities/bag.entity';

@Resolver(() => Bag)
export class BagResolver {
  constructor(private readonly bagService: BagService) {}

  @Query(() => Bag, { name: 'bag' })
  public findOne(@Args('id', { type: () => Int }) id: number) {
    return;
  }
}
