import { Injectable } from '@nestjs/common';

import type { BagContainer } from '../../domain/entities/bag-container.entity';
import type { InMemoryBagContainerRepositoryPort } from '../../domain/ports/in-memory-bag-container.port';

@Injectable()
export class InMemoryBagContainerRepository implements InMemoryBagContainerRepositoryPort {
  private readonly sessions = new Map<string, BagContainer>();

  public save(data: BagContainer): void {
    this.sessions.set(data.id, data);
  }

  public findById(id: string): BagContainer | null {
    return this.sessions.get(id) ?? null;
  }

  public remove(id: string): void {
    this.sessions.delete(id);
  }

  public findAll(): BagContainer[] {
    return Array.from(this.sessions.values());
  }
}
