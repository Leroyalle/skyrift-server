import {
  REQUEST_ATTACK_MOVE_USE_CASE_TOKEN,
  type RequestAttackMoveUseCasePort,
} from 'src/realtime/combat';

import { Inject, Injectable } from '@nestjs/common';

import type {
  RequestAttackPayload,
  RequestAttackPort,
} from '../../ports/actions/request-attack.port';

@Injectable()
export class RequestAttackUseCase implements RequestAttackPort {
  constructor(
    @Inject(REQUEST_ATTACK_MOVE_USE_CASE_TOKEN)
    private readonly requestAttackMoveUseCase: RequestAttackMoveUseCasePort,
  ) {}

  public async execute(payload: RequestAttackPayload) {
    await this.requestAttackMoveUseCase.execute({
      attackerRef: { id: payload.characterId, type: 'player' },
      victimRef: payload.target,
    });
  }
}
