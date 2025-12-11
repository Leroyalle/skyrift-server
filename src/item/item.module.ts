import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemResolver } from './item.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseItem } from './entities/item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BaseItem])],
  providers: [ItemService, ItemResolver],
  exports: [ItemService],
})
export class ItemModule {}
