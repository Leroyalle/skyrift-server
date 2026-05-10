import { ILocation } from '../../domain/types/location.type';

export interface LocationFacadePort {
  create(location: Omit<ILocation, 'id'>): Promise<ILocation>;
  delete(id: ILocation['id']): Promise<void>;
}
