export interface ILocation {
  id: string;
  passableMap: number[][];
  name: string;
  size: {
    tileWidth: number;
    tileHeight: number;
    width: number;
    height: number;
  };
  filename: string;
}
