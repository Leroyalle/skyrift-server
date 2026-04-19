import type { IBagContainer } from '../../domain/types/bag-container.type';
import type { RuntimeItem } from '../../domain/types/runtime-item.type';

export interface BagContainerReaderPort {
  findById(bagId: string): IBagContainer | null;
  findItemById(bagId: string, itemId: string): RuntimeItem | null;
}
