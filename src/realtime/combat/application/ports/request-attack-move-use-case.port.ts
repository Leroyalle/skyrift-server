import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

export interface RequestAttackMovePayload {
  attackerRef: IEntityRef;
  victimRef: IEntityRef;
}

export interface RequestAttackMoveUseCasePort {
  execute(payload: RequestAttackMovePayload): Promise<void>;
}
