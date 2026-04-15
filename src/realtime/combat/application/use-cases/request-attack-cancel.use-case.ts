import {
  ENTITY_ACTION_FACADE_TOKEN,
  ENTITY_RESOLVER_TOKEN,
  type EntityActionFacadePort,
  type EntityResolverPort,
} from 'src/realtime/entity-registry';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { Inject, Injectable } from '@nestjs/common';

import type { ActionQueueRepositoryPort } from '../../domain/ports/action-queue-repository.port';
import type { RequestAttackCancelUseCasePort } from '../ports/request-attack-cancel-use-case.port';
import { ACTION_QUEUE_REPOSITORY_TOKEN } from '../ports/tokens';

interface Payload {
  entityRef: IEntityRef;
}

@Injectable()
export class RequestAttackCancelUseCase implements RequestAttackCancelUseCasePort {
  constructor(
    @Inject(ACTION_QUEUE_REPOSITORY_TOKEN)
    private readonly actionQueueRepository: ActionQueueRepositoryPort,
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(ENTITY_ACTION_FACADE_TOKEN) private readonly entityActionFacade: EntityActionFacadePort,
  ) {}

  public execute(payload: Payload) {
    const attacker = this.entityResolver.getByRef(payload.entityRef);

    if (!attacker) return;

    this.entityActionFacade.cancelAttack(attacker);
    this.actionQueueRepository.clear(payload.entityRef);
  }
}
