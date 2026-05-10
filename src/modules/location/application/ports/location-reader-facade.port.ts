import type { ILocation } from '../../domain/types/location.type';

export interface LocationReaderFacadePort {
  getAll(): Promise<ILocation[]>;
  get(id: ILocation['id']): Promise<ILocation | null>;
}
