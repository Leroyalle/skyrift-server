import type { BagContainer } from '../../domain/entities/bag-container.entity';

export interface BagContainerReaderPort {
  findById(bagId: string): BagContainer | null;
}
