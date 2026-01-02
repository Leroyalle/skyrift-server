import { Injectable, OnModuleInit } from '@nestjs/common';
import { LocationService } from 'src/world/location/location.service';
import { IRuntimeNpc } from './types/runtime-npc.type';
import { buildRuntimeNpc } from './lib/build-runtime-npc.lib';
import { getOrCreate } from 'src/game/lib/helpers/get-or-create-array.lib';
import { SpatialGridService } from '../../spatial-grid/spatial-grid.service';

@Injectable()
export class RuntimeNpcService implements OnModuleInit {
  constructor(
    private readonly locationService: LocationService,
    private readonly spatialGridService: SpatialGridService<IRuntimeNpc>,
  ) {}

  private readonly npcByLocation: Map<string, Set<string>> = new Map();
  private readonly npcById: Map<string, IRuntimeNpc> = new Map();

  public onModuleInit() {
    const locations = this.locationService.getAllCachedLocations();

    for (const location of locations) {
      location.npcSpawn.map(npcSpawn => {
        const runtimeNpc = buildRuntimeNpc(npcSpawn);
        const locationNpc = getOrCreate(this.npcByLocation, npcSpawn.location.id, () => new Set());
        runtimeNpc.forEach((npc: IRuntimeNpc) => {
          locationNpc.add(npc.id);
          this.npcById.set(npc.id, npc);
          this.spatialGridService.add(npc);
        });
      });
    }
  }

  public getById(id: string): IRuntimeNpc | undefined {
    return this.npcById.get(id);
  }
}
