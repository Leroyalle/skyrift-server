import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class Property {
  @Field()
  name: string;

  @Field()
  type: 'bool' | 'int' | 'float' | 'string';

  @Field(() => String)
  value: boolean | number | string;
}

@ObjectType()
export class Tile {
  @Field(() => Int)
  id: number;

  @Field(() => [Property], { nullable: true })
  properties?: Property[];
}

@ObjectType()
export class Tileset {
  @Field(() => Int)
  firstgid: number;

  @Field(() => Int)
  columns: number;

  @Field()
  image: string;

  @Field(() => Int)
  imageWidth: number;

  @Field(() => Int)
  margin: number;

  @Field(() => Int)
  imageheight: number;

  @Field(() => Int)
  spacing: number;

  @Field()
  name: string;

  @Field(() => Int)
  tilecount: number;

  @Field(() => Int)
  tileHeight: 32;

  @Field(() => Int)
  tilewidth: 32;

  @Field()
  source: string;

  @Field(() => [Tile], { nullable: true })
  tiles?: Tile[];
}

@ObjectType()
export class TiledObject {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  type: string;

  @Field(() => Float)
  x: number;

  @Field(() => Float)
  y: number;

  @Field(() => Float)
  width: number;

  @Field(() => Float)
  height: number;

  @Field(() => Float)
  rotation: number;

  @Field()
  visible: boolean;

  @Field(() => Int, { nullable: true })
  gid?: number; // если объект - тайл

  @Field(() => [Property], { nullable: true })
  properties?: Property[];
}

@ObjectType()
export class TiledLayer {
  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field()
  type: 'tilelayer' | 'objectgroup';

  @Field(() => Float)
  opacity: number;

  @Field()
  visible: boolean;

  @Field(() => Int)
  x: number;

  @Field(() => Int)
  y: number;

  // Поля для tilelayer
  @Field(() => [Int], { nullable: true })
  data?: number[];

  @Field(() => Int, { nullable: true })
  width?: number;

  @Field(() => Int, { nullable: true })
  height?: number;

  // Поля для objectgroup
  @Field(() => String, { nullable: true })
  draworder?: string;

  @Field(() => [TiledObject], { nullable: true })
  objects?: TiledObject[];
}

@ObjectType()
export class TiledMap {
  @Field(() => Int)
  compressionlevel: number;

  @Field(() => Int)
  height: number;

  @Field()
  infinite: boolean;

  @Field(() => [TiledLayer])
  layers: TiledLayer[];

  @Field(() => Int)
  nextlayerid: number;

  @Field(() => Int)
  nextobjectid: number;

  @Field(() => [Property])
  properties: Property[];

  @Field()
  orientation: 'orthogonal' | 'isometric' | 'staggered' | 'hexagonal';

  @Field()
  renderorder: 'right-down' | 'right-up' | 'left-down' | 'left-up';

  @Field()
  tiledversion: string;

  @Field(() => Int)
  tileheight: number;

  @Field(() => [Tileset])
  tilesets: Tileset[];

  @Field(() => Int)
  tilewidth: number;

  @Field()
  type: string;

  @Field()
  version: string;

  @Field(() => Int)
  width: number;
}
