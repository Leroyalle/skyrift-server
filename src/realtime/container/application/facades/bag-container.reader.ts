import { Inject, Injectable } from '@nestjs/common';

import type { InMemoryBagContainerRepositoryPort } from '../../domain/ports/in-memory-bag-container.port';
import type { BagContainerReaderPort } from '../ports/bag-container-reader.port';
import { BAG_CONTAINER_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class BagReaderUseCase implements BagContainerReaderPort {
  constructor(
    @Inject(BAG_CONTAINER_REPOSITORY_TOKEN)
    private readonly bagContainerRepository: InMemoryBagContainerRepositoryPort,
  ) {}

  public findById(bagId: string) {
    return this.bagContainerRepository.findById(bagId);
  }
}
