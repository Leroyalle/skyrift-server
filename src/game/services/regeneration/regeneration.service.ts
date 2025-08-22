import { Injectable } from '@nestjs/common';
import { PlayerStateService } from 'src/game/player-state.service';
import { BatchUpdateRegeneration } from 'src/game/types/batch-update/batch-update-regeneration.type';
import { SocketService } from '../socket/socket.service';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';

@Injectable()
export class RegenerationService {
  constructor(
    private readonly playerStateService: PlayerStateService,
    private readonly socketService: SocketService,
  ) {}
  public tickRegeneration() {
    const updatesByLocation = new Map<string, BatchUpdateRegeneration[]>();

    const now = Date.now();

    const characters = this.playerStateService.getCharactersArray();

    characters.forEach((char) => {
      if (now - char.lastHpRegenerationTime < 5000) return;

      if (char.hp >= char.maxHp || !char.isAlive) return;
      const hpDelta = 100;

      char.hp = Math.min(char.hp + hpDelta, char.maxHp);
      char.lastHpRegenerationTime = now;

      let locationBatch = updatesByLocation.get(char.locationId);

      if (!locationBatch) {
        locationBatch = [];
        updatesByLocation.set(char.locationId, locationBatch);
      }

      locationBatch.push({
        characterId: char.id,
        hp: char.hp,
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
