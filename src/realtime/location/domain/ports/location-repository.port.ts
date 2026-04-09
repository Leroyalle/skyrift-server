import type { ILocation } from '../types/location.type';

export interface LocationRepositoryPort {
  getAll(): Iterable<ILocation>;
  set(location: ILocation): void;
  delete(id: ILocation['id']): void;
  get(id: ILocation['id']): ILocation | null;
  setAll(locations: ILocation[]): void;
}
