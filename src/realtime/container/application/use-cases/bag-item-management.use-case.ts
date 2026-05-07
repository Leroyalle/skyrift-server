import { Inject, Injectable } from '@nestjs/common';

import type { InMemoryBagContainerRepositoryPort } from '../../domain/ports/in-memory-bag-container.port';
import type { RuntimeItem } from '../../domain/types/runtime-item.type';
import type { BagItemManagementUseCasePort } from '../ports/bag-item-management-use-case.port';
import { BAG_CONTAINER_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class BagItemManagementUseCase implements BagItemManagementUseCasePort {
  constructor(
    @Inject(BAG_CONTAINER_REPOSITORY_TOKEN)
    private readonly repository: InMemoryBagContainerRepositoryPort,
  ) {}

  public addItemToBag(containerId: string, item: RuntimeItem): void {
    const container = this.repository.findById(containerId);

    if (!container) {
      throw new Error('Container not found');
    }

    container.addItem(item);
    this.repository.save(container);
  }

  public removeItemFromBag(containerId: string, itemId: string): RuntimeItem {
    const container = this.repository.findById(containerId);

    if (!container) {
      throw new Error('Container not found');
    }

    const foundItem = container.findItem(itemId);

    if (!foundItem) {
      throw new Error('Item not found in container');
    }

    container.removeItem(itemId);
    this.repository.save(container);

    return foundItem;
  }

  public getBagItem(containerId: string, itemId: string): RuntimeItem | null {
    const container = this.repository.findById(containerId);

    if (!container) {
      throw new Error('Container not found');
    }

    return container.findItem(itemId) ?? null;
  }
}
