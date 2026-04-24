import { Module } from '@nestjs/common';

import { BagContainerReader } from './application/facades/bag-container.reader';
import { EquipmentContainerFacade } from './application/facades/equipment-container.facade';
import {
  BAG_CONTAINER_READER_TOKEN,
  BAG_CONTAINER_REPOSITORY_TOKEN,
  BAG_ITEM_MANAGEMENT_USE_CASE_TOKEN,
  CONTAINER_INITIALIZER_TOKEN,
  EQUIPMENT_CONTAINER_FACADE_TOKEN,
  EQUIPMENT_CONTAINER_REPOSITORY_TOKEN,
  MOVE_ITEM_USE_CASE_TOKEN,
} from './application/ports/tokens';
import { ContainerInitializer } from './application/services/container.initializer';
import { BagItemManagementUseCase } from './application/use-cases/bag-item-management.use-case';
import { MoveItemUseCase } from './application/use-cases/move-item.use-case';
import { InMemoryBagContainerRepository } from './infrastructure/repositories/in-memory-bag-container.repository';
import { InMemoryEquipmentContainerRepository } from './infrastructure/repositories/in-memory-equipment-container.repository';

@Module({
  providers: [
    {
      provide: CONTAINER_INITIALIZER_TOKEN,
      useClass: ContainerInitializer,
    },
    {
      provide: BAG_CONTAINER_READER_TOKEN,
      useClass: BagContainerReader,
    },
    {
      provide: EQUIPMENT_CONTAINER_FACADE_TOKEN,
      useClass: EquipmentContainerFacade,
    },
    {
      provide: BAG_ITEM_MANAGEMENT_USE_CASE_TOKEN,
      useClass: BagItemManagementUseCase,
    },
    {
      provide: MOVE_ITEM_USE_CASE_TOKEN,
      useClass: MoveItemUseCase,
    },
    {
      provide: BAG_CONTAINER_REPOSITORY_TOKEN,
      useClass: InMemoryBagContainerRepository,
    },
    {
      provide: EQUIPMENT_CONTAINER_REPOSITORY_TOKEN,
      useClass: InMemoryEquipmentContainerRepository,
    },
  ],
  exports: [
    CONTAINER_INITIALIZER_TOKEN,
    BAG_CONTAINER_READER_TOKEN,
    EQUIPMENT_CONTAINER_FACADE_TOKEN,
    BAG_ITEM_MANAGEMENT_USE_CASE_TOKEN,
    MOVE_ITEM_USE_CASE_TOKEN,
  ],
})
export class ContainerModule {}
