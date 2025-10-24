import { Module } from '@nestjs/common';
import { BagService } from './bag.service';
import { BagResolver } from './bag.resolver';
import { ItemModule } from 'src/item/item.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bag } from './entities/bag.entity';

@Module({
  imports: [ItemModule, TypeOrmModule.forFeature([Bag])],
  providers: [BagResolver, BagService],
  exports: [BagService],
})
export class BagModule {}
