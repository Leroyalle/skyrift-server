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

  @Field(() => [Property])
  properties: Property[];
}

// Тайлсет
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

// Слой карты
@ObjectType()
export class TileLayer {
  @Field(() => [Int])
  data: number[]; // одномерный массив ID тайлов

  @Field(() => Int)
  height: number;

  @Field(() => Int)
  id: number;

  @Field()
  name: string;

  @Field(() => Float)
  opacity: number;

  @Field()
  type: string; // всегда 'tilelayer'

  @Field()
  visible: boolean;

  @Field(() => Int)
  width: number;

  @Field(() => Int)
  x: number;

  @Field(() => Int)
  y: number;
}

// Основная карта
@ObjectType()
export class TiledMap {
  @Field(() => Int)
  compressionlevel: number;

  @Field(() => Int)
  height: number;

  @Field()
  infinite: boolean;

  @Field(() => [TileLayer])
  layers: TileLayer[];

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
  type: string; // всегда 'map'

  @Field()
  version: string;

  @Field(() => Int)
  width: number;
}
