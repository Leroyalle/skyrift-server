import { Module } from '@nestjs/common';
import { BagService } from './bag.service';
import { BagResolver } from './bag.resolver';
import { ItemModule } from 'src/item/item.module';

@Module({
  providers: [BagResolver, BagService],
  imports: [ItemModule],
})
export class BagModule {}
