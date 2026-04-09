import { Injectable } from '@nestjs/common';

import type { LocationRepositoryPort } from '../../domain/ports/location-repository.port';
import type { ILocation } from '../../domain/types/location.type';

@Injectable()
export class InMemoryLocationRepository implements LocationRepositoryPort {
  private readonly locations: Map<string, ILocation> = new Map();

  public set(location: ILocation): void {
    this.locations.set(location.id, location);
  }

  public get(id: ILocation['id']): ILocation | null {
    return this.locations.get(id) ?? null;
  }

  public getAll(): Iterable<ILocation> {
    return this.locations.values();
  }

  public delete(id: ILocation['id']): void {
    this.locations.delete(id);
  }
}
