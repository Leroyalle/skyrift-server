import { ItemModule } from 'src/item/item.module';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BagResolver } from './bag.resolver';
import { BagService } from './bag.service';
import { Bag } from './entities/bag.entity';

@Module({
  imports: [ItemModule, TypeOrmModule.forFeature([Bag])],
  providers: [BagResolver, BagService],
  exports: [BagService],
})
export class BagModule {}
