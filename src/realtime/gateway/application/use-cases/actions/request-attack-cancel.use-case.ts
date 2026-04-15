import {
  REQUEST_ATTACK_CANCEL_USE_CASE_TOKEN,
  type RequestAttackCancelUseCasePort,
} from 'src/realtime/combat';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { Inject, Injectable } from '@nestjs/common';

interface RequestAttackCancelPayload {
  entityRef: IEntityRef;
}

@Injectable()
export class RequestAttackCancelUseCase {
  constructor(
    @Inject(REQUEST_ATTACK_CANCEL_USE_CASE_TOKEN)
    private readonly requestAttackCancelUseCase: RequestAttackCancelUseCasePort,
  ) {}

  public execute(payload: RequestAttackCancelPayload): void {
    return this.requestAttackCancelUseCase.execute(payload);
  }
}
