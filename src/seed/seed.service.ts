import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { Location } from 'src/location/entities/location.entity';
import {
  Property,
  TiledMap,
  TiledObject,
} from 'src/common/types/tiled-map.type';
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
import { isTileLayer } from './guards/is-tile-layer';
import { v4 as uuidv4 } from 'uuid';
import { isObjectsLayer } from './guards/is-objects-layer';
import { FactionEnum } from 'src/faction/types/faction.enum';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
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

    const dawnDominionFaction = await this.factionRepository.save({
      name: FactionEnum.DawnDominion,
      description:
        'Союз королевств людей, верящих в порядок и свет. Они видят себя защитниками мира и последней надеждой цивилизации. Для врагов это надменные фанатики, готовые подавить любую свободу ради своей «истинной веры».',
      logo: 'https://example.com/elf_logo.png',
    });

    const silverleafFaction = await this.factionRepository.save({
      name: FactionEnum.Silverleaf,
      description:
        'Древние лесные народы, связанные с природой и её магией. Их цель — сохранить баланс и остановить разрушение мира. Для чужаков они кажутся холодными и надменными, как сами леса, что скрывают их города.',
      logo: 'https://example.com/elf_logo.png',
    });

    const crimsonCovenFaction = await this.factionRepository.save({
      name: FactionEnum.CrimsonCoven,
      description:
        'Культ магов крови и жрецов тьмы, чья сила питается жертвами и запретными ритуалами. Они верят, что через кровь и страдания откроется путь к новому миру. Для остальных это безумцы, которые живут войной и смертью.',
      logo: 'https://example.com/elf_logo.png',
    });

    const flamebornFaction = await this.factionRepository.save({
      name: FactionEnum.Flameborn,
      description:
        'Воинственные племена, рожденные в пепле и огне. Их идеал — сила и разрушение, только так выживает достойный. Для союзников это братья по оружию, для врагов — неумолимая стихия пожара, которую нельзя остановить.',
      logo: 'https://example.com/elf_logo.png',
    });

    const archerClass = await this.characterClassRepository.save({
      name: 'Лучник',
      description: 'Мастер стрельбы из лука и скрытности.',
      faction: silverleafFaction,
      logo: 'https://example.com/archer_logo.png',
    });

    // Доминион Рассвета
    const paladinClass = await this.characterClassRepository.save({
      name: 'Паладин',
      description: 'Тяжёлая броня и щит, держит фронт и защищает союзников.',
      faction: dawnDominionFaction,
      logo: 'https://example.com/paladin_logo.png',
    });

    const gladiatorClass = await this.characterClassRepository.save({
      name: 'Гладиатор',
      description: 'Мастер клинка, наносит мощные удары ближнего боя.',
      faction: dawnDominionFaction,
      logo: 'https://example.com/gladiator_logo.png',
    });

    const magistrClass = await this.characterClassRepository.save({
      name: 'Магистр',
      description: 'Маг, лечит союзников и поддерживает их щитами.',
      faction: dawnDominionFaction,
      logo: 'https://example.com/magistr_logo.png',
    });

    // Серебролистые
    const wardClass = await this.characterClassRepository.save({
      name: 'Хранитель',
      description: 'Защитник леса, крепкая броня и природная магия.',
      faction: silverleafFaction,
      logo: 'https://example.com/ward_logo.png',
    });

    const lunarClass = await this.characterClassRepository.save({
      name: 'Лунар',
      description: 'Меткий стрелок, мастер дальнего боя и скрытности.',
      faction: silverleafFaction,
      logo: 'https://example.com/lunar_logo.png',
    });

    const druidClass = await this.characterClassRepository.save({
      name: 'Друид',
      description: 'Лечит союзников магией природы и поддерживает щитами.',
      faction: silverleafFaction,
      logo: 'https://example.com/druid_logo.png',
    });

    // Алый Ковен
    const bloodguardClass = await this.characterClassRepository.save({
      name: 'Кровавый Щит',
      description:
        'Использует магию крови для защиты себя и ослабления врагов.',
      faction: crimsonCovenFaction,
      logo: 'https://example.com/bloodguard_logo.png',
    });

    const reaperClass = await this.characterClassRepository.save({
      name: 'Рейвен',
      description:
        'Убийца с магией крови, наносит разрушительный урон в ближнем и дальнем бою.',
      faction: crimsonCovenFaction,
      logo: 'https://example.com/reaper_logo.png',
    });

    const hemomancerClass = await this.characterClassRepository.save({
      name: 'Кровоцелитель',
      description: 'Восстанавливает союзников через ритуалы крови.',
      faction: crimsonCovenFaction,
      logo: 'https://example.com/hemomancer_logo.png',
    });

    // Пламенорождённые
    const fireguardClass = await this.characterClassRepository.save({
      name: 'Пиростраж',
      description: 'Держит фронт и сжигает врагов вокруг.',
      faction: flamebornFaction,
      logo: 'https://example.com/fireguard_logo.png',
    });

    const fireMagClass = await this.characterClassRepository.save({
      name: 'Пиромант',
      description: 'Маг огня, атакует издалека и в ближнем бою.',
      faction: flamebornFaction,
      logo: 'https://example.com/flameweaver_logo.png',
    });

    const torchClass = await this.characterClassRepository.save({
      name: 'Факел',
      description: 'Лечит союзников огненной магией.',
      faction: flamebornFaction,
      logo: 'https://example.com/torch_logo.png',
    });

    const { mapEntries } = await this.readFiles();
    let location;
    await Promise.all(
      mapEntries.map(async ({ parsedMap, filename }, i) => {
        console.log(parsedMap.tilesets);
        const tiledMap = this.optimizeTilesets(parsedMap);
        const passableMap = this.createPassableMap(tiledMap);
        this.setNameToTeleportObjects(tiledMap);

        const savedLocation = this.locationRepository.create({
          height: parsedMap.height,
          width: parsedMap.width,
          tiledMap,
          filename,
          passableMap,
          name: this.findMapName(tiledMap),
          tileWidth: tiledMap.tilewidth,
          tileHeight: tiledMap.tileheight,
        });
        if (i === 0) location = savedLocation;
        await this.locationRepository.save(savedLocation);

        console.log('Location saved', savedLocation.name);
      }),
    );

    const firstCharacter = await this.characterRepository.save({
      name: 'Leroyalle',
      user: firstUser,
      characterClass: lunarClass,
      level: 1,
      location,
      x: 2016,
      y: 960,
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
      characterClass: fireMagClass,
      level: 1,
      location,
      x: 2016,
      y: 960,
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
      characterClass: lunarClass,
      icon: '/sprites/skills/archer/fire-arrow.png',
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
      characterClass: fireMagClass,
      icon: '/sprites/skills/archer/fire-hail.png',
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
    const maps = fs.readdirSync(mapsDir).filter((f) => f.endsWith('.tmj'));
    const tilesetsDir = path.join(__dirname, '..', 'assets', 'tilesets');
    const tilesets = fs
      .readdirSync(tilesetsDir)
      .filter((f) => f.endsWith('.xml'));

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

      return { parsedMap, filename: map.split('.')[0] };
    });
    console.log(mapEntries.length);
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

  // private transformMapLayerData(layer: TileLayer) {
  //   const tileData: number[][] = [];

  //   for (let i = 0; i < layer.height; i++) {
  //     const row = layer.data.slice(i * layer.width, (i + 1) * layer.width);
  //     tileData.push(row);
  //   }

  //   return tileData;
  // }
  // private getPassableData(layer: TileLayer, tileset: Record<string, any>) {
  //   const passableData: number[][] = [];

  //   const mergedTilesetData = Object.values(tileset).reduce(
  //     (acc, tileGroup) => {
  //       return { ...acc, ...tileGroup };
  //     },
  //     {},
  //   );

  //   for (let i = 0; i < layer.height; i++) {
  //     const row = layer.data
  //       .map((tileId) => {
  //         return mergedTilesetData[tileId]?.passable === 'false' ? 0 : 1;
  //       })
  //       .slice(i * layer.width, (i + 1) * layer.width);
  //     passableData.push(row);
  //   }
  //   return passableData;
  // }

  private findMapName(tiledMap: TiledMap) {
    return String(
      tiledMap.properties.find((property) => property.name === 'name')?.value,
    );
  }

  private optimizeTilesets(map: TiledMap) {
    const usesIds = new Set<number>();
    for (const layer of map.layers) {
      if (!isTileLayer(layer)) continue;
      layer.data.forEach((gid) => {
        if (gid > 0) usesIds.add(gid);
      });
    }

    map.tilesets.forEach((tileset) => {
      const { firstgid } = tileset;
      console.log(tileset.tiles);
      tileset.tiles = tileset.tiles?.filter((tile) =>
        usesIds.has(firstgid + tile.id),
      );
    });

    return map;
  }

  private createPassableMap(map: TiledMap) {
    const tilesMap = new Map<number, Property[]>();
    map.tilesets.forEach((tileset) => {
      const { firstgid } = tileset;

      tileset.tiles?.forEach((tile) => {
        tilesMap.set(firstgid + tile.id, tile.properties ?? []);
      });
    });

    const passableMap: number[][] = Array.from({ length: map.height }, () =>
      Array(map.width).fill(1),
    );

    for (const layer of map.layers) {
      if (!isTileLayer(layer)) continue;

      for (let y = 0; y < layer.height; y++) {
        for (let x = 0; x < layer.width; x++) {
          const tileIndex = y * layer.width + x;
          const tileId = layer.data[tileIndex];
          if (!tileId) continue;

          const props = tilesMap.get(tileId);
          if (!props) continue;
          const passableProperty = props.find(
            (prop) => prop.name === 'passable',
          );
          if (passableProperty && passableProperty.value === false) {
            passableMap[y][x] = 0;
          }
        }
      }
    }

    return passableMap;
  }

  private setNameToTeleportObjects = (map: TiledMap) => {
    const teleportsLayer = map.layers.find(
      (layer) => layer.name === 'Teleports' && layer.type === 'objectgroup',
    );

    if (!teleportsLayer) return;

    if (!isObjectsLayer(teleportsLayer)) return;

    teleportsLayer.objects.forEach((obj) => {
      const uuid = uuidv4() as string;

      obj.name = uuid;

      return obj;
    });

    return map;
  };

  // private buildPassableMap(
  //   map: TiledMap,
  //   tileset: Record<string, any>,
  // ): number[][] {
  //   const mergedTilesetData = Object.values(tileset).reduce(
  //     (acc, tileGroup) => ({ ...acc, ...tileGroup }),
  //     {},
  //   );

  //   const passableMap: number[][] = Array.from({ length: map.height }, () =>
  //     Array(map.width).fill(1),
  //   );

  //   for (const layer of map.layers) {
  //     if (layer.type !== 'tilelayer') continue;

  //     for (let y = 0; y < layer.height; y++) {
  //       for (let x = 0; x < layer.width; x++) {
  //         const tileIndex = y * layer.width + x;
  //         const tileId = layer.data[tileIndex];
  //         if (!tileId) continue;

  //         const props = mergedTilesetData[tileId];
  //         if (props?.passable === 'false') {
  //           passableMap[y][x] = 0;
  //         }
  //       }
  //     }
  //   }

  //   return passableMap;
  // }
}
