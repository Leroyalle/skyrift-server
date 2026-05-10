import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

export interface RequestAttackPort {
  execute(payload: RequestAttackPayload): Promise<void>;
}

export interface RequestAttackPayload {
  target: IEntityRef;
  characterId: string;
  locationId: string;
  userId: string;
}
