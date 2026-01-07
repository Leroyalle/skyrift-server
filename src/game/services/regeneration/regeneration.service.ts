import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { getOrCreate } from 'src/game/lib/helpers/get-or-create-array.lib';
import { BatchUpdateRegeneration } from 'src/game/types/batch-update/batch-update-regeneration.type';

import { Injectable } from '@nestjs/common';

import { EntityRegistryService } from '../entity-registry/entity-registry.service';
import { SocketService } from '../socket/socket.service';

@Injectable()
export class RegenerationService {
  constructor(
    private readonly registryService: EntityRegistryService,

    private readonly socketService: SocketService,
  ) {}
  // TODO: add for mobs
  public tickRegeneration() {
    const updatesByLocation = new Map<string, BatchUpdateRegeneration[]>();

    const now = Date.now();

    const characters = this.registryService.charactersArray;

    characters.forEach(char => {
      if (now - char.lastHpRegenerationTime < 5000) return;

      if (char.hp >= char.maxHp || !char.isAlive) return;
      const hpDelta = 100;

      char.hp = Math.min(char.hp + hpDelta, char.maxHp);
      char.lastHpRegenerationTime = now;

      const locationBatch = getOrCreate(updatesByLocation, char.locationId, () => []);

      locationBatch.push({
        id: char.id,
        type: 'player',
        hp: char.hp,
        hpDelta,
      });
    });

    const mobs = this.registryService.mobsArray;

    mobs.forEach(mob => {
      if (now - mob.lastHpRegenerationTime < 5000) return;

      let hpDelta = 100;
      if (mob.hp >= mob.maxHp || !mob.isAlive) return;
      if (mob.state === 'return' && mob.hp < mob.maxHp) {
        hpDelta = mob.maxHp - mob.hp;
      }

      mob.hp = Math.min(mob.hp + hpDelta, mob.maxHp);
      mob.lastHpRegenerationTime = now;

      const locationBatch = getOrCreate(updatesByLocation, mob.locationId, () => []);

      locationBatch.push({
        id: mob.id,
        type: 'mob',
        hp: mob.hp,
        hpDelta,
      });
    });
    for (const [locationId, updates] of updatesByLocation.entries()) {
      this.socketService.sendTo(
        RedisKeys.Location + locationId,
        ServerToClientEvents.PlayerResourcesBatch,
        updates,
      );
    }
  }
}
