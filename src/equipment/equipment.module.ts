import { ItemModule } from 'src/item/item.module';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Equipment } from './entities/equipment.entity';
import { EquipmentService } from './equipment.service';

@Module({
  imports: [TypeOrmModule.forFeature([Equipment]), ItemModule],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
