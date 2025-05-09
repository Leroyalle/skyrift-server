import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { Location } from 'src/location/entities/location.entity';
import { TiledMap, TileLayer } from 'src/common/types/tiled-map.type';
import { LocationLayer } from 'src/location/entities/location-layer.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as xml2js from 'xml2js';
import { Faction } from 'src/faction/entities/faction.entity';
import { CharacterClass } from 'src/character-class/entities/character-class.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(LocationLayer)
    private locationLayerRepository: Repository<LocationLayer>,
    @InjectRepository(Faction)
    private factionRepository: Repository<Faction>,
    @InjectRepository(CharacterClass)
    private characterClassRepository: Repository<CharacterClass>,
  ) {}

  public async run() {
    await this.clearDatabase();

    await this.userRepository.save({
      name: 'Leroyalle',
      email: 'leroyalle@example.com',
      password: 'password',
      refreshToken: null,
    });

    const createdFaction = await this.factionRepository.save({
      name: 'Эльфы',
      description:
        'Эльфы - это раса, известная своей грацией и магическими способностями.',
      logo: 'https://example.com/elf_logo.png',
    });

    await this.characterClassRepository.save({
      name: 'Лучник',
      description: 'Мастер стрельбы из лука и скрытности.',
      faction: createdFaction,
      logo: 'https://example.com/archer_logo.png',
    });

    const { mapEntries, tilesetEntries } = await this.readFiles();

    for (const mapEntry of mapEntries) {
      console.log(mapEntry.tilewidth, mapEntry.tileheight);
      const location = this.locationRepository.create({
        height: mapEntry.height,
        width: mapEntry.width,
        startX: 0,
        startY: 0,
        name: this.findMapName(mapEntry),
        tilesetKey: mapEntry.tilesets[0].source,
        mapImageUrl: mapEntry.tilesets[0].source,
        tileWidth: mapEntry.tilewidth,
        tileHeight: mapEntry.tileheight,
      });
      await this.locationRepository.save(location);

      console.log('Location saved', location.name);

      await Promise.all(
        mapEntry.layers.map(async (layer, layerIndex) => {
          const tileData = this.transformMapLayerData(layer);

          const passableData = this.getPassableData(layer, tilesetEntries[0]);

          await this.locationLayerRepository.save({
            name: layer.name,
            layerIndex,
            tileData,
            location,
            passableData,
            type: layer.type,
          });
        }),
      );
    }

    console.log('Listings seeded');
  }

  private async clearDatabase() {
    await this.userRepository.query('TRUNCATE TABLE "user" CASCADE');
    await this.locationLayerRepository.query(
      'TRUNCATE TABLE "location_layer" CASCADE',
    );
    await this.locationRepository.query('TRUNCATE TABLE "location" CASCADE');
    console.log('Listings cleared');
  }

  private async readFiles() {
    const mapsDir = path.join(__dirname, '..', 'assets', 'maps');
    const maps = fs.readdirSync(mapsDir);
    const tilesetsDir = path.join(__dirname, '..', 'assets', 'tilesets');
    const tilesets = fs.readdirSync(tilesetsDir);

    const tilesetEntries = await Promise.all(
      tilesets.map(async (tileset) => {
        const tilesetPath = path.join(tilesetsDir, tileset);
        const result = await this.parseXmlTileset(tilesetPath);
        return {
          [tileset]: result,
        };
      }),
    );

    const mapEntries = maps.map((map) => {
      const filePath = path.join(mapsDir, map);
      const parsedMap = JSON.parse(
        fs.readFileSync(filePath, 'utf-8'),
      ) as TiledMap;

      return parsedMap;
    });

    return { tilesetEntries, mapEntries };
  }

  private async parseXmlTileset(filePath: string) {
    const xml = fs.readFileSync(filePath, 'utf-8');
    const parser = new xml2js.Parser();

    try {
      const result = await parser.parseStringPromise(xml);
      const entries = result.tileset.tile.map((tile: any) => {
        const id = tile.$.id;
        const propsArray = tile.properties?.[0]?.property ?? [];
        const props = propsArray.reduce(
          (acc: Record<string, any>, prop: any) => {
            acc[prop.$.name] = prop.$.value;
            return acc;
          },
          {},
        );
        return [id, props] as [string, Record<string, any>];
      });

      return Object.fromEntries(entries as [string, any][]);
    } catch (err) {
      console.error('Ошибка при парсинге XML:', err);
      throw err;
    }
  }

  private transformMapLayerData(layer: TileLayer) {
    const tileData: number[][] = [];

    for (let i = 0; i < layer.height; i++) {
      const row = layer.data.slice(i * layer.width, (i + 1) * layer.width);
      tileData.push(row);
    }

    return tileData;
  }
  private getPassableData(layer: TileLayer, tileset: Record<string, any>) {
    const passableData: number[][] = [];

    const mergedTilesetData = Object.values(tileset).reduce(
      (acc, tileGroup) => {
        return { ...acc, ...tileGroup };
      },
      {},
    );

    for (let i = 0; i < layer.height; i++) {
      const row = layer.data
        .map((tileId) => {
          return mergedTilesetData[tileId]?.passable === 'false' ? 0 : 1;
        })
        .slice(i * layer.width, (i + 1) * layer.width);
      passableData.push(row);
    }
    return passableData;
  }

  private findMapName(tiledMap: TiledMap) {
    return String(
      tiledMap.properties.find((property) => property.name === 'name')?.value,
    );
  }
}
