import {
  REQUEST_ATTACK_CANCEL_USE_CASE_TOKEN,
  type RequestAttackCancelUseCasePort,
} from 'src/realtime/combat';

import { Inject, Injectable } from '@nestjs/common';

import type { SocketUserData } from '../../ports/socket-adapter.port';

@Injectable()
export class RequestAttackCancelUseCase {
  constructor(
    @Inject(REQUEST_ATTACK_CANCEL_USE_CASE_TOKEN)
    private readonly requestAttackCancelUseCase: RequestAttackCancelUseCasePort,
  ) {}

  public execute(payload: SocketUserData): void {
    return this.requestAttackCancelUseCase.execute({
      entityRef: { id: payload.characterId, type: 'player' },
    });
  }
}
