import type { IBagContainer } from '../../domain/types/bag-container.type';

export interface BagContainerReaderPort {
  findById(bagId: string): IBagContainer | null;
}
