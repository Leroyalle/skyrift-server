import { ENTITY_RESOLVER_TOKEN, type EntityResolverPort } from 'src/realtime/entity-registry';
import { LOCATION_READER_TOKEN, type LocationReaderPort } from 'src/realtime/location';
import {
  APPROACH_TARGET_SERVICE_TOKEN,
  type ApproachTargetServicePort,
} from 'src/realtime/movement';

import { Inject, Injectable } from '@nestjs/common';

import type { InteractionRepositoryPort } from '../../domain/ports/interaction-repository.port';
import type {
  RequestTalkToNpcPayload,
  RequestTalkToNpcPort,
} from '../ports/request-talk-to-npc.port';
import { INTERACTION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class RequestTalkToNpcUseCase implements RequestTalkToNpcPort {
  constructor(
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(LOCATION_READER_TOKEN) private readonly locationReader: LocationReaderPort,
    @Inject(INTERACTION_REPOSITORY_TOKEN)
    private readonly interactionRepository: InteractionRepositoryPort,
    @Inject(APPROACH_TARGET_SERVICE_TOKEN)
    private readonly approachTargetService: ApproachTargetServicePort,
  ) {}

  public async execute(payload: RequestTalkToNpcPayload) {
    const character = this.entityResolver.getByRef({ type: 'player', id: payload.characterId });

    if (!character) throw new Error("Character doesn't exist");

    const npc = this.entityResolver.getByRef({ type: 'npc', id: payload.npcId });

    if (!npc) throw new Error("Npc doesn't exist");

    const location = this.locationReader.getById(payload.locationId);

    if (!location) throw new Error("Location doesn't exist");

    const result = await this.approachTargetService.execute({
      actor: character,
      target: npc,
      location,
    });

    if (!result) return;

    this.interactionRepository.add({
      characterId: payload.characterId,
      type: 'talk',
      targetId: npc.id,
    });
  }
}
