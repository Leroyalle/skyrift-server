import * as fs from 'fs';
import * as path from 'path';
import { TiledMap } from 'src/common/types/tiled-map.type';
import * as xml2js from 'xml2js';

export async function readFiles() {
  const mapsDir = path.join(__dirname, '..', '..', '..', 'assets', 'maps');
  const maps = fs.readdirSync(mapsDir).filter(f => f.endsWith('.tmj'));
  const tilesetsDir = path.join(__dirname, '..', '..', '..', 'assets', 'tilesets');
  const tilesets = fs.readdirSync(tilesetsDir).filter(f => f.endsWith('.xml'));
  const tilesetEntries = await Promise.all(
    tilesets.map(async tileset => {
      const tilesetPath = path.join(tilesetsDir, tileset);
      const result = await parseXmlTileset(tilesetPath);
      return {
        [tileset]: result,
      };
    }),
  );
  const mapEntries = maps.map(map => {
    const filePath = path.join(mapsDir, map);
    const parsedMap = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as TiledMap;
    return { parsedMap, filename: map.split('.')[0] };
  });
  return { tilesetEntries, mapEntries };
}

async function parseXmlTileset(filePath: string) {
  const xml = fs.readFileSync(filePath, 'utf-8');
  const parser = new xml2js.Parser();
  try {
    const result = await parser.parseStringPromise(xml);
    const entries = result.tileset.tile.map((tile: any) => {
      const id = tile.$.id;
      const propsArray = tile.properties?.[0]?.property ?? [];
      const props = propsArray.reduce((acc: Record<string, any>, prop: any) => {
        acc[prop.$.name] = prop.$.value;
        return acc;
      }, {});
      return [id, props] as [string, Record<string, any>];
    });
    return Object.fromEntries(entries as [string, any][]);
  } catch (err) {
    console.error('Ошибка при парсинге XML:', err);
    throw err;
  }
}
