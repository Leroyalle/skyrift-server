import { ItemRegistryService } from 'src/game/services/item-registry/item-registry.service';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Armor, BaseItem, Resource, Weapon } from './entities/item.entity';
import { ItemService } from './item.service';

@Module({
  imports: [TypeOrmModule.forFeature([BaseItem, Armor, Weapon, Resource])],
  providers: [ItemService, ItemRegistryService],
  exports: [ItemService, ItemRegistryService],
})
export class ItemModule {}
