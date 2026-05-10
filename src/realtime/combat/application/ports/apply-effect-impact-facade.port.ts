import type { EntitySnapshot } from 'src/realtime/entity-registry';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

export interface ApplyEffectImpactFacadePort {
  execute(payload: ApplyEffectImpactPayload): ReturnType | undefined;
}

interface ReturnType {
  hp: number;
  isAlive: boolean;
  damage: number;
}

export interface ApplyEffectImpactPayload {
  effectType: 'damage_over_time';
  target: EntitySnapshot;
  attackerRef: IEntityRef;
  magnitude: number;
  occurredAt: number;
  skillId?: string | null;
}
