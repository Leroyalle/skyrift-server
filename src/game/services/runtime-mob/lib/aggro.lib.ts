import { EntityRef } from 'src/game/types/entity/entity-ref.type';

export class AggroTable {
  private currentTarget: EntityRef;
  private threatMap = new Map<string, number>();

  public updateThreatMap(entityId: string, damage: number) {
    const entityThreat = (this.threatMap.get(entityId) ?? 0) + damage;
    this.threatMap.set(entityId, entityThreat);
  }
}
