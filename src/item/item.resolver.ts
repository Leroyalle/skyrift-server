import { Query, Resolver } from '@nestjs/graphql';
import { BaseItem } from './entities/item.entity';
import { ItemService } from './item.service';

@Resolver(BaseItem)
export class ItemResolver {
  constructor(private readonly itemsService: ItemService) {}
}
