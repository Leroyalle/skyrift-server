import { SOCKET_ADAPTER_TOKEN, type SocketAdapterPort } from 'src/infrastructure/ws';
import { ServerToClientEvents } from 'src/realtime/contracts/constants/socket-events.constant';
import { ENTITY_RESOLVER_TOKEN, type EntityResolverPort } from 'src/realtime/entity-registry';
import type { ILocation } from 'src/realtime/location';
import {
  APPROACH_TARGET_SERVICE_TOKEN,
  type ApproachTargetServicePort,
} from 'src/realtime/movement';
import type { PlayerSessionSnapshot } from 'src/realtime/player-session';
import { QUEST_READER_TOKEN, type QuestReaderPort } from 'src/realtime/quest';

import { Inject, Injectable } from '@nestjs/common';

import type { InteractionRepositoryPort } from '../../domain/ports/interaction-repository.port';
import { INTERACTION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class NpcInteractionService {
  constructor(
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(INTERACTION_REPOSITORY_TOKEN)
    private readonly interactionRepository: InteractionRepositoryPort,
    @Inject(APPROACH_TARGET_SERVICE_TOKEN)
    private readonly approachTargetService: ApproachTargetServicePort,
    @Inject(QUEST_READER_TOKEN) private readonly questReader: QuestReaderPort,
    @Inject(SOCKET_ADAPTER_TOKEN) private readonly socketAdapter: SocketAdapterPort,
  ) {}

  public async execute(
    character: PlayerSessionSnapshot,
    npcId: string,
    location: ILocation,
  ): Promise<void> {
    const npc = this.entityResolver.getByRef({ type: 'npc', id: npcId });

    if (!npc) return;

    const result = await this.approachTargetService.execute({
      actor: character,
      target: npc,
      location,
    });

    if (!result) {
      this.interactionRepository.delete(character.id);
      return;
    }

    const quests = this.questReader.findByGiverId(npc.id);

    this.socketAdapter.sendToUser(character.userId, ServerToClientEvents.QuestList, {
      quests: quests,
    });
  }
}
