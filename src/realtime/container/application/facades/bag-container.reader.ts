import { Inject, Injectable } from '@nestjs/common';

import type { InMemoryBagContainerRepositoryPort } from '../../domain/ports/in-memory-bag-container.port';
import type { BagContainerReaderPort } from '../ports/bag-container-reader.port';
import { BAG_CONTAINER_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class BagContainerReader implements BagContainerReaderPort {
  constructor(
    @Inject(BAG_CONTAINER_REPOSITORY_TOKEN)
    private readonly bagContainerRepository: InMemoryBagContainerRepositoryPort,
  ) {}

  public findById(bagId: string) {
    const bag = this.bagContainerRepository.findById(bagId);
    if (!bag) return null;
    return bag.snapshot();
  }

  public findItemById(bagId: string, itemId: string) {
    const bag = this.bagContainerRepository.findById(bagId);
    if (!bag) return null;
    return bag.findItem(itemId);
  }
}
