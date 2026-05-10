import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

interface RequestAttackCancelPayload {
  entityRef: IEntityRef;
}

export interface RequestAttackCancelUseCasePort {
  execute(payload: RequestAttackCancelPayload): void;
}
