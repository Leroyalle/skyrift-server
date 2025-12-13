import { Module } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipment } from './entities/equipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Equipment])],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
