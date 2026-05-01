import * as argon2 from 'argon2';
import { EquipmentSlot } from 'src/common/types/equipment-slot.type';
import { BAG_FACADE_TOKEN, BagFacadePort } from 'src/modules/bag';
import { CHARACTER_FACADE_TOKEN, CharacterFacadePort } from 'src/modules/character';
import {
  CHARACTER_CLASS_FACADE_TOKEN,
  CharacterClassFacadePort,
  ICharacterClass,
} from 'src/modules/character-class';
import { EFFECT_FACADE_TOKEN, EffectFacadePort } from 'src/modules/effect';
import { EQUIPMENT_FACADE_TOKEN, EquipmentFacadePort } from 'src/modules/equipment';
import { FACTION_FACADE_TOKEN, FactionFacadePort } from 'src/modules/faction';
import {
  ITEM_INSTANCE_FACADE_TOKEN,
  ITEM_TEMPLATE_FACADE_TOKEN,
  ItemContainerType,
  ItemInstance,
  ItemInstanceFacadePort,
  ItemTemplateFacadePort,
} from 'src/modules/item';
import { ILocation, LOCATION_FACADE_TOKEN, LocationFacadePort } from 'src/modules/location';
import { IMob, MOB_FACADE_TOKEN, MobFacadePort } from 'src/modules/mob';
import { NPC_FACADE_TOKEN, NpcFacadePort } from 'src/modules/npc';
import { OWNED_SKILL_FACADE_TOKEN, OwnedSkillFacadePort } from 'src/modules/owned-skill';
import { QUEST_FACADE_TOKEN, QuestFacadePort, StepType } from 'src/modules/quest';
import { ISkill, SKILL_FACADE_TOKEN, SkillFacadePort } from 'src/modules/skill';
import { IEntitySpawn, SPAWN_FACADE_TOKEN, SpawnFacadePort } from 'src/modules/spawn';
import { IUser, USER_FACADE_TOKEN, UserFacadePort } from 'src/modules/user';
import { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import { DataSource } from 'typeorm';

import { Inject, Injectable } from '@nestjs/common';

import { createPassableMap } from './lib/create-passable-map.lib';
import { getMapName } from './lib/get-map-name.lib';
import { optimizeTilesets } from './lib/optimize-tilesets.lib';
import { readFiles } from './lib/read-files.lib';
import { setNameToTeleportObjects } from './lib/set-name-to-teleport-objects.lib';

@Injectable()
export class SeedService {
  constructor(
    @Inject(USER_FACADE_TOKEN) private readonly userFacade: UserFacadePort,
    @Inject(FACTION_FACADE_TOKEN) private readonly factionFacade: FactionFacadePort,
    @Inject(CHARACTER_CLASS_FACADE_TOKEN)
    private readonly characterClassFacade: CharacterClassFacadePort,
    @Inject(LOCATION_FACADE_TOKEN) private readonly locationFacade: LocationFacadePort,
    @Inject(MOB_FACADE_TOKEN) private readonly mobFacade: MobFacadePort,
    @Inject(EQUIPMENT_FACADE_TOKEN) private readonly equipmentFacade: EquipmentFacadePort,
    @Inject(ITEM_TEMPLATE_FACADE_TOKEN) private readonly itemTemplateFacade: ItemTemplateFacadePort,
    @Inject(ITEM_INSTANCE_FACADE_TOKEN) private readonly itemInstanceFacade: ItemInstanceFacadePort,
    @Inject(SPAWN_FACADE_TOKEN) private readonly spawnFacade: SpawnFacadePort,
    @Inject(CHARACTER_FACADE_TOKEN) private readonly characterFacade: CharacterFacadePort,
    @Inject(BAG_FACADE_TOKEN) private readonly bagFacade: BagFacadePort,
    @Inject(SKILL_FACADE_TOKEN) private readonly skillFacade: SkillFacadePort,
    @Inject(OWNED_SKILL_FACADE_TOKEN) private readonly ownedSkillFacade: OwnedSkillFacadePort,
    @Inject(EFFECT_FACADE_TOKEN) private readonly effectFacade: EffectFacadePort,
    @Inject(NPC_FACADE_TOKEN) private readonly npcFacade: NpcFacadePort,
    @Inject(QUEST_FACADE_TOKEN) private readonly questFacade: QuestFacadePort,
    private readonly dataSource: DataSource,
  ) {}

  public async run() {
    await this.clearDatabase();

    const { firstUser, secondUser } = await this.createUsers();

    const { dawnDominionFaction, silverleafFaction, crimsonCovenFaction } =
      await this.createFactions();

    const { archerClass } = await this.createClasses(
      dawnDominionFaction.id,
      silverleafFaction.id,
      crimsonCovenFaction.id,
    );

    const locations = await this.createLocations();
    const darkEqquipmentTemplates = await this.createItemTemplates('dark');
    const redEqquipmentTemplates = await this.createItemTemplates('red');

    const spawns = await this.createSpawns(locations);

    const mobs = await this.createMobs(locations, spawns, {
      helmetId: darkEqquipmentTemplates.helmetTemplate.id,
      breastplateId: darkEqquipmentTemplates.breastplateTemplate.id,
    });

    const players = await this.createPlayers(
      {
        first: firstUser,
        second: secondUser,
      },
      { archerClass },
      locations,
      {
        breastplateId: redEqquipmentTemplates.breastplateTemplate.id,
        helmetId: redEqquipmentTemplates.helmetTemplate.id,
      },
    );

    const skills = await this.createSkills(archerClass.id);

    await this.createOwnedSkills({ id: players.first.id, type: 'player' }, [
      skills.fireArrowSkill.id,
      skills.fireHailSkill.id,
    ]);

    await this.createEffects({
      fireArrowSkill: skills.fireArrowSkill,
      fireHailSkill: skills.fireHailSkill,
    });

    const npcs = await this.createNpcs(spawns[1], locations, {
      helmetId: darkEqquipmentTemplates.helmetTemplate.id,
      breastplateId: darkEqquipmentTemplates.breastplateTemplate.id,
    });

    await this.createQuests(
      mobs,
      { alfredId: npcs.alfred.id },
      {
        helmetId: darkEqquipmentTemplates.helmetTemplate.id,
        breastplateId: darkEqquipmentTemplates.breastplateTemplate.id,
      },
    );
  }

  private async createQuests(
    mobs: IMob[],
    npcs: {
      alfredId: string;
    },
    templateIds: { helmetId: string; breastplateId: string },
  ) {
    const firstQuest = await this.questFacade.create({
      name: 'Оркестратор',
      description: 'Убей 5 орков где-то поблизости',
      expReward: 100,
      goldReward: 200,
      itemRewards: [
        {
          quantity: 1,
          templateId: templateIds.helmetId,
        },
      ],
      prerequisites: null,
      steps: [
        {
          id: 'first',
          description: 'Убейте 5 орков',
          type: StepType.Kill,
          count: 5,
          entityRef: {
            type: 'mob',
            id: mobs[0].id,
          },
          // mobTemplateId: mobs[0].id,
          // target: 'mob',
        },
        {
          id: 'final',
          description: 'Поговорите с магистром',
          type: StepType.Talk,
          npcId: npcs.alfredId,
        },
      ],
      giverNpcId: npcs.alfredId,
    });

    return { firstQuest };
  }

  private async createNpcs(
    spawn: IEntitySpawn,
    locations: ILocation[],
    templateIds: { helmetId: string; breastplateId: string },
  ) {
    const alfredNpc = await this.npcFacade.create({
      name: 'Альфред',
      magicDefense: 1,
      physicalDefense: 1,
      attackRange: 1,
      walkSpeed: 300,
      chaseSpeed: 450,
      x: spawn.spawnX,
      y: spawn.spawnY,
      maxHp: 1000,
      hp: 1000,
      level: 3,
      attackSpeed: 1000,
      critMultiplier: 1,
      baseMagicDamage: 30,
      basePhysicalDamage: 41,
      appearance: {
        body: 'body_base',
        head: 'head_base',
      },
      equipmentId: null,
      isAlive: true,
      locationId: locations[0].id,
      spawnId: spawn.id,
    });

    const equipmentId = await this.createEquipment(
      {
        id: alfredNpc.id,
        type: 'npc',
      },
      templateIds,
    );

    await this.npcFacade.update(alfredNpc.id, {
      ...alfredNpc,
      equipmentId: equipmentId,
    });

    return { alfred: alfredNpc };
  }

  private async createEffects(payload: { fireArrowSkill: ISkill; fireHailSkill: ISkill }) {
    await this.effectFacade.create({
      skillId: payload.fireArrowSkill.id,
      type: 'stun',
      durationMs: 300,
    });
  }

  private async createOwnedSkills(owner: IEntityRef, skillIds: string[]) {
    for (const skillId of skillIds) {
      await this.ownedSkillFacade.create({
        skillId,
        ownerRef: owner,
        cooldownEnd: 0,
        lastUsedAt: 0,
        level: 1,
      });
    }
  }

  private async createSkills(classId: string) {
    const fireArrowSkill = await this.skillFacade.create({
      name: 'Огненная стрела',
      damage: 92,
      cooldownMs: 5000,
      manaCost: 10,
      // effects: [stanEffect],
      classId,
      heal: 0,
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
      type: 'Target',
    });
    const fireHailSkill = await this.skillFacade.create({
      name: 'Огненный град',
      cooldownMs: 5000,
      manaCost: 10,
      classId,
      icon: '/sprites/skills/archer/fire-hail.png',
      range: 5,
      tilesetKey: 'spells-tileset.png',
      damage: 0,
      heal: 0,
      // TODO: update
      visualEffects: [
        {
          type: 'animation',
          assetKey: 'fire-hail_animation',
          durationMs: 5000,
        },
      ],
      type: 'AoE',
      duration: 5000,
      damagePerSecond: 40,
      areaRadius: 1,
    });

    return { fireArrowSkill, fireHailSkill };
  }

  private async createBag(owner: IEntityRef) {
    const bag = await this.bagFacade.create({
      ownerId: owner.id,
      ownerType: owner.type,
      currentSlots: 10,
      maxSlots: 10,
    });
    return bag.id;
  }

  private async createPlayers(
    users: { first: IUser; second: IUser },
    classes: { archerClass: ICharacterClass },
    locations: ILocation[],
    templateIds: { helmetId: string; breastplateId: string },
  ) {
    const firstCharacter = await this.characterFacade.create({
      name: 'Leroyalle',
      userId: users.first.id,
      classId: classes.archerClass.id,
      level: 1,
      locationId: locations[0].id,
      equipmentId: null,
      x: 2016,
      y: 960,
      maxHp: 1000,
      hp: 1000,
      baseMagicDamage: 20,
      basePhysicalDamage: 50,
      critMultiplier: 1,
      experienceToNextLevel: 400,
      attackRange: 4,
      attackSpeed: 1000,
      appearance: {
        body: 'body_base',
        head: 'head_base',
      },
      bagId: null,
      experience: 0,
      magicDefense: 1,
      physicalDefense: 1,
      questsIds: [],
      skillPoints: 0,
      skillsIds: [],
      walkSpeed: 450,
    });

    const equipmentId = await this.createEquipment(
      {
        id: firstCharacter.id,
        type: 'player',
      },
      templateIds,
    );

    const bagId = await this.createBag({
      id: firstCharacter.id,
      type: 'player',
    });

    await this.characterFacade.update(firstCharacter.id, {
      ...firstCharacter,
      equipmentId: equipmentId,
      bagId: bagId,
    });

    return { first: firstCharacter };
  }

  private async createSpawns(locations: ILocation[]) {
    const mobSpawn = await this.spawnFacade.create({
      locationId: locations[0].id,
      spawnX: 1700,
      spawnY: 1200,
      areaRadius: 3,
    });

    const npcSpawn = await this.spawnFacade.create({
      locationId: locations[0].id,
      spawnX: 2000,
      spawnY: 1000,
      areaRadius: 3,
    });

    return [mobSpawn, npcSpawn];
  }

  private async createMobs(
    locations: ILocation[],
    spawns: IEntitySpawn[],
    templateIds: { helmetId: string; breastplateId: string },
  ) {
    const mobs: IMob[] = [];

    for (let i = 0; i <= 5; i++) {
      const spawn = spawns[0];

      const mob = await this.mobFacade.create({
        name: 'Моб #' + i,
        magicDefense: 1,
        physicalDefense: 1,
        attackRange: 1,
        walkSpeed: 300,
        chaseSpeed: 450,
        triggerRange: 3,
        x: spawn.spawnX,
        y: spawn.spawnY,
        maxHp: 1000,
        hp: 1000,
        respawnTime: 5000,
        level: 3,
        expReward: 20,
        attackSpeed: 1000,
        critMultiplier: 1,
        baseMagicDamage: 30,
        basePhysicalDamage: 41,
        appearance: {
          body: 'body_base',
          head: 'head_base',
        },
        equipmentId: null,
        isAlive: true,
        locationId: locations[0].id,
        spawnId: spawn.id,
      });

      const equipmentId = await this.createEquipment(
        {
          id: mob.id,
          type: 'mob',
        },
        templateIds,
      );

      await this.mobFacade.update(mob.id, {
        ...mob,
        equipmentId: equipmentId,
      });
      mobs.push(mob);
    }

    return mobs;
  }

  private async createEquipment(
    ownerRef: IEntityRef,
    templateIds: { helmetId: string; breastplateId: string },
  ) {
    const equipment = await this.equipmentFacade.save({
      ownerRef: {
        id: ownerRef.id,
        type: ownerRef.type,
      },
      breastplateId: null,
      helmetId: null,
      cloakId: null,
      glovesId: null,
      legsId: null,
      mainHandId: null,
      offHandId: null,
      ring1Id: null,
      ring2Id: null,
    });

    const equippableInstances = await this.createEquippableItemInstances([
      {
        containerId: equipment.id,
        containerType: 'equipment',
        templateId: templateIds.breastplateId,
        slot: 'breastplate',
      },
      {
        containerId: equipment.id,
        containerType: 'equipment',
        templateId: templateIds.helmetId,
        slot: 'helmet',
      },
    ]);

    await this.equipmentFacade.update(equipment.id, {
      ownerRef: {
        id: ownerRef.id,
        type: ownerRef.type,
      },
      ...equippableInstances,
    });

    return equipment.id;
  }

  private async createEquippableItemInstances(
    payload: {
      containerId: string;
      containerType: ItemContainerType;
      templateId: string;
      slot: EquipmentSlot;
    }[],
  ) {
    const slotIds: Record<`${EquipmentSlot}Id`, ItemInstance['id'] | null> = {
      breastplateId: null,
      cloakId: null,
      glovesId: null,
      helmetId: null,
      legsId: null,
      mainHandId: null,
      offHandId: null,
      ring1Id: null,
      ring2Id: null,
    };

    for (const item of payload) {
      const instance = await this.itemInstanceFacade.create({
        containerId: item.containerId,
        containerType: item.containerType,
        durability: 1,
        quantity: 1,
        templateId: item.templateId,
      });
      slotIds[item.slot + 'Id'] = instance.id;
    }

    return slotIds;
  }

  private async createItemTemplates(breast: 'red' | 'dark') {
    const helmetTemplate = await this.itemTemplateFacade.create({
      itemType: 'armor',
      slot: 'helmet',
      texture: {
        atlasKey: 'helmet_iron',
        frameName: 'helmet-iron',
      },
      physicalDefense: 13,
      name: 'Железный шлем',
      iconKey: 'helmet_iron',
      magicDamage: null,
      physicalDamage: null,
      // durability: 1,
      magicDefense: 1,
      // bag: null,
    });

    const breastplateTemplate = await this.itemTemplateFacade.create({
      itemType: 'armor',
      slot: 'breastplate',
      texture: {
        atlasKey: `breastplate_${breast}`,
        frameName: `breastplate-${breast}`,
      },
      physicalDefense: 11,
      name: `${breast === 'red' ? 'Красный' : 'Темный'} нагрудник`,
      iconKey: `breastplate_${breast}`,
      magicDefense: 1,
      magicDamage: null,
      physicalDamage: null,
    });

    return { helmetTemplate, breastplateTemplate };
  }

  private async createLocations() {
    const { mapEntries } = await readFiles();
    const savedLocations = await Promise.all(
      mapEntries.map(async ({ parsedMap, filename }) => {
        const tiledMap = optimizeTilesets(parsedMap);
        const passableMap = createPassableMap(tiledMap);
        setNameToTeleportObjects(tiledMap);
        const savedLocation = await this.locationFacade.create({
          height: parsedMap.height,
          width: parsedMap.width,
          tiledMap,
          filename,
          passableMap,
          name: getMapName(tiledMap),
          tileWidth: tiledMap.tilewidth,
          tileHeight: tiledMap.tileheight,
        });
        console.log('Location saved', savedLocation.name);

        return savedLocation;
        // return await this.locationRepository.save(savedLocation);
      }),
    );

    return savedLocations;
  }

  private async createFactions() {
    const dawnDominionFaction = await this.factionFacade.create({
      name: 'DawnDominion',
      description:
        'Союз королевств людей, верящих в порядок и свет. Они видят себя защитниками мира и последней надеждой цивилизации. Для врагов это надменные фанатики, готовые подавить любую свободу ради своей «истинной веры».',
      logo: 'https://example.com/elf_logo.png',
    });
    const silverleafFaction = await this.factionFacade.create({
      name: 'Silverleaf',
      description:
        'Древние лесные народы, связанные с природой и её магией. Их цель — сохранить баланс и остановить разрушение мира. Для чужаков они кажутся холодными и надменными, как сами леса, что скрывают их города.',
      logo: 'https://example.com/elf_logo.png',
    });
    const crimsonCovenFaction = await this.factionFacade.create({
      name: 'CrimsonCoven',
      description:
        'Культ магов крови и жрецов тьмы, чья сила питается жертвами и запретными ритуалами. Они верят, что через кровь и страдания откроется путь к новому миру. Для остальных это безумцы, которые живут войной и смертью.',
      logo: 'https://example.com/elf_logo.png',
    });

    return {
      dawnDominionFaction,
      silverleafFaction,
      crimsonCovenFaction,
    };
  }

  private async createUsers() {
    const firstUser = await this.userFacade.create({
      name: 'Leroyalle',
      email: 'nikolajmelonov@yandex.ru',
      password: await argon2.hash('123123'),
    });

    const secondUser = await this.userFacade.create({
      name: 'Consul',
      email: 'consuldev@yandex.ru',
      password: await argon2.hash('123123'),
    });

    return {
      firstUser,
      secondUser,
    };
  }

  private async createClasses(
    dawnDominionFactionId: string,
    silverleafFactionId: string,
    crimsonCovenFactionId: string,
  ) {
    const archerClass = await this.characterClassFacade.create({
      name: 'Лучник',
      description: 'Мастер стрельбы из лука и скрытности.',
      factionId: dawnDominionFactionId,
      logo: 'https://example.com/archer_logo.png',
      skillsIds: [],
    });
    const paladinClass = await this.characterClassFacade.create({
      name: 'Паладин',
      description: 'Тяжёлая броня и щит, держит фронт и защищает союзников.',
      factionId: silverleafFactionId,
      logo: 'https://example.com/paladin_logo.png',
      skillsIds: [],
    });
    const gladiatorClass = await this.characterClassFacade.create({
      name: 'Гладиатор',
      description: 'Мастер клинка, наносит мощные удары ближнего боя.',
      factionId: crimsonCovenFactionId,
      logo: 'https://example.com/gladiator_logo.png',
      skillsIds: [],
    });

    return { archerClass, paladinClass, gladiatorClass };
  }

  private async clearDatabase() {
    const tables: string[] = [
      'bags',
      'characters',
      'character_classes',
      'effects',
      'equipments',
      'factions',
      'item_instances',
      'item_templates',
      'locations',
      'mobs',
      'npcs',
      'owned_skills',
      'player_quests',
      'quests',
      'skills',
      'entity_spawns',
      'users',
    ];
    await this.dataSource.query(`TRUNCATE TABLE ${tables.map(t => `"${t}"`).join(', ')} CASCADE`);
    console.log('Database cleared');
  }
}

//   private async parseXmlTileset(filePath: string) {
//     const xml = fs.readFileSync(filePath, 'utf-8');
//     const parser = new xml2js.Parser();
//     try {
//       const result = await parser.parseStringPromise(xml);
//       const entries = result.tileset.tile.map((tile: any) => {
//         const id = tile.$.id;
//         const propsArray = tile.properties?.[0]?.property ?? [];
//         const props = propsArray.reduce((acc: Record<string, any>, prop: any) => {
//           acc[prop.$.name] = prop.$.value;
//           return acc;
//         }, {});
//         return [id, props] as [string, Record<string, any>];
//       });
//       return Object.fromEntries(entries as [string, any][]);
//     } catch (err) {
//       console.error('Ошибка при парсинге XML:', err);
//       throw err;
//     }
//   }
//   // private transformMapLayerData(layer: TileLayer) {
//   //   const tileData: number[][] = [];
//   //   for (let i = 0; i < layer.height; i++) {
//   //     const row = layer.data.slice(i * layer.width, (i + 1) * layer.width);
//   //     tileData.push(row);
//   //   }
//   //   return tileData;
//   // }
//   // private getPassableData(layer: TileLayer, tileset: Record<string, any>) {
//   //   const passableData: number[][] = [];
//   //   const mergedTilesetData = Object.values(tileset).reduce(
//   //     (acc, tileGroup) => {
//   //       return { ...acc, ...tileGroup };
//   //     },
//   //     {},
//   //   );
//   //   for (let i = 0; i < layer.height; i++) {
//   //     const row = layer.data
//   //       .map((tileId) => {
//   //         return mergedTilesetData[tileId]?.passable === 'false' ? 0 : 1;
//   //       })
//   //       .slice(i * layer.width, (i + 1) * layer.width);
//   //     passableData.push(row);
//   //   }
//   //   return passableData;
//   // }
//   private findMapName(tiledMap: TiledMap) {
//     return String(tiledMap.properties.find(property => property.name === 'name')?.value);
//   }
//   private optimizeTilesets(map: TiledMap) {
//     const usesIds = new Set<number>();
//     for (const layer of map.layers) {
//       if (!isTileLayer(layer)) continue;
//       layer.data.forEach(gid => {
//         if (gid > 0) usesIds.add(gid);
//       });
//     }
//     map.tilesets.forEach(tileset => {
//       const { firstgid } = tileset;
//       tileset.tiles = tileset.tiles?.filter(tile => usesIds.has(firstgid + tile.id));
//     });
//     return map;
//   }
//   private createPassableMap(map: TiledMap) {
//     const tilesMap = new Map<number, Property[]>();
//     map.tilesets.forEach(tileset => {
//       const { firstgid } = tileset;
//       tileset.tiles?.forEach(tile => {
//         tilesMap.set(firstgid + tile.id, tile.properties ?? []);
//       });
//     });
//     const passableMap: number[][] = Array.from({ length: map.height }, () =>
//       Array(map.width).fill(1),
//     );
//     for (const layer of map.layers) {
//       if (!isTileLayer(layer)) continue;
//       for (let y = 0; y < layer.height; y++) {
//         for (let x = 0; x < layer.width; x++) {
//           const tileIndex = y * layer.width + x;
//           const tileId = layer.data[tileIndex];
//           if (!tileId) continue;
//           const props = tilesMap.get(tileId);
//           if (!props) continue;
//           const passableProperty = props.find(prop => prop.name === 'passable');
//           if (passableProperty && passableProperty.value === false) {
//             passableMap[y][x] = 0;
//           }
//         }
//       }
//     }
//     return passableMap;
//   }
//   private setNameToTeleportObjects = (map: TiledMap) => {
//     const teleportsLayer = map.layers.find(
//       layer => layer.name === 'Teleports' && layer.type === 'objectgroup',
//     );
//     if (!teleportsLayer) return;
//     if (!isObjectsLayer(teleportsLayer)) return;
//     teleportsLayer.objects.forEach(obj => {
//       const uuid = uuidv4() as string;
//       obj.name = uuid;
//       return obj;
//     });
//     return map;
//   };
//   // private buildPassableMap(
//   //   map: TiledMap,
//   //   tileset: Record<string, any>,
//   // ): number[][] {
//   //   const mergedTilesetData = Object.values(tileset).reduce(
//   //     (acc, tileGroup) => ({ ...acc, ...tileGroup }),
//   //     {},
//   //   );
//   //   const passableMap: number[][] = Array.from({ length: map.height }, () =>
//   //     Array(map.width).fill(1),
//   //   );
//   //   for (const layer of map.layers) {
//   //     if (layer.type !== 'tilelayer') continue;
//   //     for (let y = 0; y < layer.height; y++) {
//   //       for (let x = 0; x < layer.width; x++) {
//   //         const tileIndex = y * layer.width + x;
//   //         const tileId = layer.data[tileIndex];
//   //         if (!tileId) continue;
//   //         const props = mergedTilesetData[tileId];
//   //         if (props?.passable === 'false') {
//   //           passableMap[y][x] = 0;
//   //         }
//   //       }
//   //     }
//   //   }
//   //   return passableMap;
//   // }
