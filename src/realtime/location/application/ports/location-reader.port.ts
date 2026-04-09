import type { ILocation } from '../../domain/types/location.type';

export interface LocationReaderPort {
  getById(id: ILocation['id']): ILocation | null;
}
