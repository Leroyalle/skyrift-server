import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemResolver } from './item.resolver';

@Module({
  providers: [ItemResolver, ItemService],
  exports: [ItemService],
})
export class ItemModule {}
