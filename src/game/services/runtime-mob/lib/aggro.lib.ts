import { decodeEntityKey } from 'src/game/lib/entity/decode-entity-key.lib';
import { generateEntityKey } from 'src/game/lib/entity/generate-entity-key.lib';
import { EntityRef } from 'src/game/types/entity/entity-ref.type';
import { EntityKey } from 'src/game/types/entity/keys/entity-key.type';

export class AggroTable {
  private currentTarget: EntityRef | null = null;
  private threatMap = new Map<EntityKey, number>();

  public get getCurrentTarget() {
    return this.currentTarget;
  }

  public updateThreatMap(entityRef: EntityRef, damage: number): void {
    console.log('updateThreatMap', entityRef, damage);
    const key = generateEntityKey(entityRef);
    const entityThreat = (this.threatMap.get(key) ?? 0) + damage;
    this.threatMap.set(key, entityThreat);
    this.updateCurrentTarget();
  }

  private updateCurrentTarget(switchThreshold: number = 10): EntityRef | null {
    let potentialTarget = this.currentTarget;
    let bestThreat = potentialTarget
      ? (this.threatMap.get(generateEntityKey(potentialTarget)) ?? 0)
      : 0;

    for (const [entityKey, threat] of this.threatMap.entries()) {
      if (!this.currentTarget && threat > bestThreat) {
        bestThreat = threat;
        const entityRef = decodeEntityKey(entityKey);
        potentialTarget = entityRef;
        continue;
      } else if (threat > bestThreat + switchThreshold) {
        bestThreat = threat;
        const entityRef = decodeEntityKey(entityKey);
        potentialTarget = entityRef;
        continue;
      }
    }

    this.currentTarget = potentialTarget;
    console.log('CURRENT TARGET', this.currentTarget);
    return this.currentTarget;
  }

  public removeEntity(entityRef: EntityRef): EntityRef | null {
    const isTarget =
      this.currentTarget && generateEntityKey(this.currentTarget) === generateEntityKey(entityRef);

    if (isTarget) {
      this.currentTarget = null;
    }
    this.threatMap.delete(generateEntityKey(entityRef));
    return this.updateCurrentTarget();
  }

  public clear(): EntityRef | null {
    this.threatMap.clear();
    this.currentTarget = null;
    return this.currentTarget;
  }
}
