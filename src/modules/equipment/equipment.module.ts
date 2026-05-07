import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EquipmentFacade } from './application/facades/equipment.facade';
import { EQUIPMENT_FACADE_TOKEN, EQUIPMENT_REPOSITORY_TOKEN } from './application/ports/tokens';
import { EquipmentOrmEntity } from './infrastructure/persistence/entities/equipment-orm.entity';
import { EquipmentPersistenceRepository } from './infrastructure/persistence/repositories/equipment-persistence.repository';

@Module({
  imports: [TypeOrmModule.forFeature([EquipmentOrmEntity])],
  providers: [
    {
      provide: EQUIPMENT_REPOSITORY_TOKEN,
      useClass: EquipmentPersistenceRepository,
    },
    {
      provide: EQUIPMENT_FACADE_TOKEN,
      useClass: EquipmentFacade,
    },
  ],
  exports: [EQUIPMENT_FACADE_TOKEN],
})
export class EquipmentModule {}
