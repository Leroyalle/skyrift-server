import type { ILocation } from 'src/realtime/location';
import type { PlayerSessionSnapshot } from 'src/realtime/player-session';

import { Injectable } from '@nestjs/common';

import type { Interaction } from '../../domain/types/interaction.type';
import type { InteractionResolverPort } from '../ports/interaction-resolver-service.port';

import type { NpcInteractionService } from './npc-interaction.service';
import type { TeleportInteractionService } from './teleport-interaction.service';

@Injectable()
export class InteractionResolverService implements InteractionResolverPort {
  constructor(
    private readonly npcInteractionService: NpcInteractionService,
    private readonly teleportInteractionService: TeleportInteractionService,
  ) {}

  public async execute(
    character: PlayerSessionSnapshot,
    location: ILocation,
    interaction: Interaction,
  ): Promise<void> {
    switch (interaction.type) {
      case 'talk':
        return await this.npcInteractionService.execute(character, interaction.targetId, location);
      case 'teleport': {
        const teleport = location.teleportsMap[interaction.targetId];

        if (!teleport) return;

        return await this.teleportInteractionService.execute(
          character,
          location,
          teleport,
          interaction,
        );
      }
    }
  }
}
