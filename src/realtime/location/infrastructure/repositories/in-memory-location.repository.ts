import { Injectable } from '@nestjs/common';

import type { LocationRepositoryPort } from '../../domain/ports/location-repository.port';
import type { ILocation } from '../../domain/types/location.type';

@Injectable()
export class InMemoryLocationRepository implements LocationRepositoryPort {
  private readonly locations: Map<string, ILocation> = new Map();
  private readonly locationsByFilename: Map<string, string> = new Map();

  public set(location: ILocation): void {
    this.locations.set(location.id, location);
    this.locationsByFilename.set(location.filename, location.id);
  }

  public get(id: ILocation['id']): ILocation | null {
    return this.locations.get(id) ?? null;
  }

  public getAll(): Iterable<ILocation> {
    return this.locations.values();
  }

  public delete(id: ILocation['id']): void {
    const location = this.get(id);
    if (location) {
      this.locations.delete(id);
      this.locationsByFilename.delete(location.filename);
    }
  }

  public setAll(locations: ILocation[]): void {
    locations.forEach(location => {
      this.set(location);
      this.locationsByFilename.set(location.filename, location.id);
    });
  }

  public getByFilename(filename: ILocation['filename']): ILocation | null {
    const id = this.locationsByFilename.get(filename);
    if (!id) return null;
    return this.get(id);
  }
}
