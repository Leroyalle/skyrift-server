import { Inject, Injectable } from '@nestjs/common';

import { BagContainer } from '../../domain/entities/bag-container.entity';
import { EquipmentContainer } from '../../domain/entities/equipment-container.entity';
import type { InMemoryBagContainerRepositoryPort } from '../../domain/ports/in-memory-bag-container.port';
import type { InMemoryEquipmentContainerRepositoryPort } from '../../domain/ports/in-memory-equipment-container-repository.port';
import type { IBagContainer } from '../../domain/types/bag-container.type';
import type { IEquipmentContainer } from '../../domain/types/equipment-container.type';
import type { ContainerInitializerPort } from '../ports/container-initializer.port';
import {
  BAG_CONTAINER_REPOSITORY_TOKEN,
  EQUIPMENT_CONTAINER_REPOSITORY_TOKEN,
} from '../ports/tokens';

@Injectable()
export class ContainerInitializer implements ContainerInitializerPort {
  constructor(
    @Inject(BAG_CONTAINER_REPOSITORY_TOKEN)
    private readonly bagRepository: InMemoryBagContainerRepositoryPort,
    @Inject(EQUIPMENT_CONTAINER_REPOSITORY_TOKEN)
    private readonly equipmentRepository: InMemoryEquipmentContainerRepositoryPort,
  ) {}

  public initializeBag(payload: IBagContainer): IBagContainer {
    const entity = BagContainer.create(payload);
    this.bagRepository.save(entity);

    return entity.snapshot();
  }

  public clearBag(containerId: string): void {
    this.bagRepository.remove(containerId);
  }

  public initializeEquipment(payload: IEquipmentContainer): IEquipmentContainer {
    const entity = EquipmentContainer.create(payload);
    this.equipmentRepository.save(entity);
    return entity.snapshot();
  }

  public clearEquipment(containerId: string): void {
    this.equipmentRepository.remove(containerId);
  }
}
