import { type FactionName, FactionRelationPolicy } from 'src/realtime/faction';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

interface Entity extends IEntityRef {
  faction: FactionName;
}

export class CombatTargetingPolicy {
  public static canHit(attacker: Entity, victim: Entity): boolean {
    if (attacker.id === victim.id && attacker.type === victim.type) return false;
    // if (FactionRelationPolicy.areAllies(attacker.faction, victim.faction)) return false;
    return true;
  }
}
