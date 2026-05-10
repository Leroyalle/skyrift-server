import type { ILocation } from '../../domain/types/location.type';

export interface BootstrapLocationsUseCasePort {
  execute(location: Omit<ILocation, 'teleportsMap'>[]): void;
}
