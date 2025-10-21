import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BagService } from './bag.service';
import { Bag } from './entities/bag.entity';
import { CreateBagInput } from './dto/create-bag.input';
import { UpdateBagInput } from './dto/update-bag.input';

@Resolver(() => Bag)
export class BagResolver {
  constructor(private readonly bagService: BagService) {}

  @Mutation(() => Bag)
  createBag(@Args('createBagInput') createBagInput: CreateBagInput) {
    return this.bagService.create(createBagInput);
  }

  @Query(() => [Bag], { name: 'bag' })
  findAll() {
    return this.bagService.findAll();
  }

  @Query(() => Bag, { name: 'bag' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.bagService.findOne(id);
  }

  @Mutation(() => Bag)
  updateBag(@Args('updateBagInput') updateBagInput: UpdateBagInput) {
    return this.bagService.update(updateBagInput.id, updateBagInput);
  }

  @Mutation(() => Bag)
  removeBag(@Args('id', { type: () => Int }) id: number) {
    return this.bagService.remove(id);
  }
}
