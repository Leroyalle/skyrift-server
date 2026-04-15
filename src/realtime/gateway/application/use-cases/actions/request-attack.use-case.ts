import {
  REQUEST_ATTACK_MOVE_USE_CASE_TOKEN,
  type RequestAttackMoveUseCasePort,
} from 'src/realtime/combat';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { Inject, Injectable } from '@nestjs/common';

import type { SocketUserData } from '../../ports/socket-adapter.port';

interface RequestAttackPayload extends SocketUserData {
  target: IEntityRef;
}

@Injectable()
export class RequestAttackUseCase {
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
