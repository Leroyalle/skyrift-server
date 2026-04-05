import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

export class CombatTargetingPolicy {
  public static canHit(attacker: IEntityRef, victim: IEntityRef): boolean {
    if (attacker.id === victim.id && attacker.type === victim.type) return false;
    return true;
  }
}
