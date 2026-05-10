import type { ILocation } from '../../domain/types/location.type';
import { buildTeleportsMapAssembler } from '../../infrastructure/assemblers/build-teleports-map.assembler';

export class LocationAssembler {
  public static toDomain = (location: Omit<ILocation, 'teleportsMap'>): ILocation => {
    return {
      ...location,
      teleportsMap: buildTeleportsMapAssembler(location.tiledMap),
    };
  };
}
