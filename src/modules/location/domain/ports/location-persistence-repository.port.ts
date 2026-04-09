import type { ILocation } from '../types/location.type';

export interface LocationPersistenceRepositoryPort {
  save(location: ILocation): Promise<void>;
  delete(id: ILocation['id']): Promise<void>;
  getAll(): Promise<ILocation[]>;
  get(id: ILocation['id']): Promise<ILocation | null>;
}
