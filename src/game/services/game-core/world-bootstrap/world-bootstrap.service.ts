import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';
import { ItemService } from 'src/item/item.service';
import { LocationService } from 'src/world/location/location.service';

import { Injectable, OnModuleInit } from '@nestjs/common';

import { buildRuntimeMobs } from '../../characters/runtime-mob/lib/build-runtime-mobs.lib';
import { buildRuntimeNpc } from '../../characters/runtime-npc/lib/build-runtime-npc.lib';
import { EntityRegistryService } from '../../entity-registry/entity-registry.service';
import { ItemRegistryService } from '../../item-registry/item-registry.service';
import { SpatialGridService } from '../../spatial-grid/spatial-grid.service';

@Injectable()
export class WorldBootstrapService implements OnModuleInit {
  constructor(
    private readonly locationService: LocationService,
    private readonly entityRegistryService: EntityRegistryService,
    private readonly itemRegistryService: ItemRegistryService,
    private readonly itemService: ItemService,
    private readonly spatialGridService: SpatialGridService<TRuntimeEntity>,
  ) {}

  public async onModuleInit() {
    const locations = await this.locationService.findAndCacheAll();
    for (const location of locations) {
      location.mobSpawn.forEach(mobSpawn => {
        const runtimeMobs = buildRuntimeMobs(mobSpawn);
        runtimeMobs.forEach(runtimeMob => {
          this.entityRegistryService.add(runtimeMob);
          this.spatialGridService.add(runtimeMob);
        });
      });

      location.npcSpawn.forEach(npcSpawn => {
        const runtimeNpc = buildRuntimeNpc(npcSpawn);
        runtimeNpc.forEach(npc => {
          this.entityRegistryService.add(npc);
          this.spatialGridService.add(npc);
        });
      });
    }

    const allItems = await this.itemService.findAllItems();
    allItems.forEach(item => this.itemRegistryService.add(item));
  }
}
