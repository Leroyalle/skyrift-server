import {
  REQUEST_ATTACK_CANCEL_USE_CASE_TOKEN,
  type RequestAttackCancelUseCasePort,
} from 'src/realtime/combat';

import { Inject, Injectable } from '@nestjs/common';

import type {
  RequestAttackCancelPayload,
  RequestAttackCancelPort,
} from '../../ports/actions/request-attack-cancel.port';

@Injectable()
export class RequestAttackCancelUseCase implements RequestAttackCancelPort {
  constructor(
    @Inject(REQUEST_ATTACK_CANCEL_USE_CASE_TOKEN)
    private readonly requestAttackCancelUseCase: RequestAttackCancelUseCasePort,
  ) {}

  public execute(payload: RequestAttackCancelPayload): void {
    return this.requestAttackCancelUseCase.execute({
      entityRef: { id: payload.characterId, type: 'player' },
    });
  }
}
