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
import { Character } from 'src/character/entities/character.entity';
import * as argon2 from 'argon2';
import { CharacterSkill } from 'src/character/character-skill/entities/character-skill.entity';
import { Skill } from 'src/character-class/skill/entities/skill.entity';
import { SkillType } from 'src/common/enums/skill/skill-type.enum';
import { EffectType } from 'src/common/enums/skill/effect-type.enum';

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
    @InjectRepository(Character)
    private characterRepository: Repository<Character>,
    @InjectRepository(Skill)
    private skillRepository: Repository<Skill>,
    @InjectRepository(CharacterSkill)
    private characterSkillRepository: Repository<CharacterSkill>,
  ) {}

  public async run() {
    await this.clearDatabase();

    const firstUser = await this.userRepository.save({
      name: 'Leroyalle',
      email: 'nikolajmelonov@yandex.ru',
      password: await argon2.hash('123123'),
      refreshToken: null,
    });

    const secondUser = await this.userRepository.save({
      name: 'Consul',
      email: 'consuldev@yandex.ru',
      password: await argon2.hash('123123'),
      refreshToken: null,
    });

    const createdFaction = await this.factionRepository.save({
      name: 'Эльфы',
      description:
        'Эльфы - это раса, известная своей грацией и магическими способностями.',
      logo: 'https://example.com/elf_logo.png',
    });

    const archerClass = await this.characterClassRepository.save({
      name: 'Лучник',
      description: 'Мастер стрельбы из лука и скрытности.',
      faction: createdFaction,
      logo: 'https://example.com/archer_logo.png',
    });

    const { mapEntries, tilesetEntries } = await this.readFiles();
    // FIXME: update character seed
    let location;
    for (const mapEntry of mapEntries) {
      console.log(mapEntry.tilewidth, mapEntry.tileheight);
      const savedLocation = this.locationRepository.create({
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
      location = savedLocation;
      await this.locationRepository.save(savedLocation);

      console.log('Location saved', savedLocation.name);

      await Promise.all(
        mapEntry.layers.map(async (layer, layerIndex) => {
          const tileData = this.transformMapLayerData(layer);

          const passableData = this.getPassableData(layer, tilesetEntries[0]);

          await this.locationLayerRepository.save({
            name: layer.name,
            layerIndex,
            tileData,
            location: savedLocation,
            passableData,
            type: layer.type,
          });
        }),
      );
    }

    const firstCharacter = await this.characterRepository.save({
      name: 'Егор Вытрус',
      user: firstUser,
      characterClass: archerClass,
      level: 1,
      location,
      x: 400,
      y: 400,
      maxHp: 1000,
      hp: 1000,
      basePhysicalDamage: 50,
      attackRange: 4,
      attackSpeed: 1000,
      isAlive: true,
    });

    await this.characterRepository.save({
      name: 'Consul',
      user: secondUser,
      characterClass: archerClass,
      level: 1,
      location,
      x: 450,
      y: 450,
      maxHp: 1000,
      hp: 1000,
      basePhysicalDamage: 50,
      attackRange: 4,
      attackSpeed: 1000,
      isAlive: true,
    });

    const fireArrowSkill = await this.skillRepository.save({
      name: 'Огненная стрела',
      damage: 92,
      cooldownMs: 5000,
      manaCost: 10,
      characterClass: archerClass,
      icon: '/assets/skills/archer/fire-arrow.png',
      range: 8,
      tilesetKey: 'spells-tileset.png',
      // TODO: update
      visualEffects: [
        {
          type: 'animation',
          assetKey: 'fire-arrow_animation',
          durationMs: 3000,
        },
      ],
      type: SkillType.Target,
    });

    const fireHailSkill = await this.skillRepository.save({
      name: 'Огненный град',
      cooldownMs: 5000,
      manaCost: 10,
      characterClass: archerClass,
      icon: '/assets/skills/archer/fire-hail.png',
      range: 5,
      tilesetKey: 'spells-tileset.png',
      // TODO: update
      visualEffects: [
        {
          type: 'animation',
          assetKey: 'fire-hail_animation',
          durationMs: 5000,
        },
      ],
      type: SkillType.AoE,
      duration: 5000,
      damagePerSecond: 40,
      areaRadius: 1,
      effects: [
        {
          damagePerSecond: 37,
          durationMs: 5000,
          type: EffectType.DamageOverTime,
        },
      ],
    });

    await this.characterSkillRepository.save({
      character: firstCharacter,
      skill: fireArrowSkill,
    });

    await this.characterSkillRepository.save({
      character: firstCharacter,
      skill: fireHailSkill,
    });

    console.log('Listings seeded');
  }

  private async clearDatabase() {
    await this.userRepository.query('TRUNCATE TABLE "user" CASCADE');
    await this.locationLayerRepository.query(
      'TRUNCATE TABLE "location_layer" CASCADE',
    );
    await this.locationRepository.query('TRUNCATE TABLE "location" CASCADE');
    await this.factionRepository.query('TRUNCATE TABLE "faction" CASCADE');
    await this.characterClassRepository.query(
      'TRUNCATE TABLE "character_class" CASCADE',
    );
    await this.characterRepository.query('TRUNCATE TABLE "character" CASCADE');
    await this.skillRepository.query('TRUNCATE TABLE "skill" CASCADE');
    await this.characterSkillRepository.query(
      'TRUNCATE TABLE "character_skill" CASCADE',
    );
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
