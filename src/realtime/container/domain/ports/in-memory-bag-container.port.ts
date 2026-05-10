import type { BagContainer } from '../entities/bag-container.entity';

export interface InMemoryBagContainerRepositoryPort {
  save(data: BagContainer): void;
  findById(id: string): BagContainer | null;
  findAll(): BagContainer[];
  remove(id: string): void;
}
