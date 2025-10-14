import { EntityRef } from 'src/game/types/entity/entity-ref.type';
import { IAttackInitiation } from 'src/game/types/pending-actions.type';

export interface IProjectile extends IAttackInitiation {
  // attackerRef: EntityRef;
  victimRef: EntityRef;
  skillId: string | null;
}
