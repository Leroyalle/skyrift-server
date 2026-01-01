import { Module } from '@nestjs/common';
import { ItemService } from './item.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Armor, BaseItem, Resource, Weapon } from './entities/item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BaseItem, Armor, Weapon, Resource])],
  providers: [ItemService],
  exports: [ItemService],
})
export class ItemModule {}
