import type { IEntityType } from 'src/realtime/shared/types/entity-ref.type';
import type { SkillType } from 'src/realtime/skill-session';

import type { ActionType, CombatTarget } from '../../domain/types/action-queue.type';
import type { BatchUpdateAction } from '../../domain/types/batch-update-action.type';

export interface ActionResolverServicePort {
  execute(payload: ActionResolverPayload): void;
}

export interface ActionResolverPayload {
  attacker: {
    lastAttackAt: number;
    attackSpeed: number;
    position: { x: number; y: number; locationId: string };
    id: string;
    type: IEntityType;
    userId: string | null;
  };
  target: CombatTarget;
  batchLocation: BatchUpdateAction[];
  action: {
    skill: SkillSpecs | null;
    actionType: ActionType;
  };
  context: {
    now: number;
    tileSize: number;
    removeAction: () => void;
  };
}

interface SkillSpecs {
  cooldownMs: number;
  lastUsedAt: number;
  cooldownEnd: number;
  id: string;
  type: SkillType;
}
