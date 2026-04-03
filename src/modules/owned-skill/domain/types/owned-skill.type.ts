import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

export interface IOwnedSkill {
  id: string;
  skillId: string;
  ownerRef: IEntityRef;
  lastUsedAt: number;
  cooldownEnd: number;
  level: number;
}
