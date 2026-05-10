import type { ILocation as ILocationInput } from 'src/modules/location';
import type { ILocation as ILocationOutput } from 'src/realtime/location';

export class BootstrapLocationsMapper {
  public static toPayload = (location: ILocationInput): Omit<ILocationOutput, 'teleportsMap'> => {
    return {
      name: location.name,
      size: {
        tileHeight: location.tileHeight,
        tileWidth: location.tileWidth,
        width: location.width,
        height: location.height,
      },
      tiledMap: location.tiledMap,
      passableMap: location.passableMap,
      filename: location.filename,
      id: location.id,
    };
  };
}
