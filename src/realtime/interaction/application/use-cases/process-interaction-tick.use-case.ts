import { SOCKET_ADAPTER_TOKEN, type SocketAdapterPort } from 'src/infrastructure/ws';
import { ENTITY_RESOLVER_TOKEN, type EntityResolverPort } from 'src/realtime/entity-registry';
import { LOCATION_READER_TOKEN, type LocationReaderPort } from 'src/realtime/location';

import { Inject, Injectable } from '@nestjs/common';

import type { InteractionRepositoryPort } from '../../domain/ports/interaction-repository.port';
import type { InteractionResolverPort } from '../ports/interaction-resolver-service.port';
import type { ProcessInteractionTickPort } from '../ports/process-interaction-tick.port';
import { INTERACTION_REPOSITORY_TOKEN, INTERACTION_RESOLVER_SERVICE_TOKEN } from '../ports/tokens';

@Injectable()
export class ProcessInteractionTickUseCase implements ProcessInteractionTickPort {
  constructor(
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(INTERACTION_REPOSITORY_TOKEN)
    private readonly interactionRepository: InteractionRepositoryPort,
    @Inject(LOCATION_READER_TOKEN) private readonly locationReader: LocationReaderPort,
    @Inject(SOCKET_ADAPTER_TOKEN) private readonly socketAdapter: SocketAdapterPort,
    @Inject(INTERACTION_RESOLVER_SERVICE_TOKEN)
    private readonly interactionResolverService: InteractionResolverPort,
  ) {}

  public async execute() {
    for (const interaction of this.interactionRepository.getIterable()) {
      const character = this.entityResolver.getByRef({
        type: 'player',
        id: interaction.characterId,
      });

      if (!character) {
        this.interactionRepository.delete(interaction.characterId);
        continue;
      }

      const location = this.locationReader.getById(character.position.locationId);

      if (!location) {
        this.interactionRepository.delete(interaction.characterId);
        continue;
      }

      await this.interactionResolverService.execute(character, location, interaction);
    }
  }
}
