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

  public updateThreatMap(
    entityRef: EntityRef,
    damage: number,
  ): EntityRef | null {
    const key = generateEntityKey(entityRef);
    const entityThreat = (this.threatMap.get(key) ?? 0) + damage;
    this.threatMap.set(key, entityThreat);
    return this.updateCurrentTarget();
  }

  public updateCurrentTarget(switchThreshold: number = 100): EntityRef | null {
    let potentialTarget = this.currentTarget;
    let bestThreat = this.currentTarget
      ? (this.threatMap.get(generateEntityKey(this.currentTarget)) ?? 0)
      : 0;

    for (const threat of this.threatMap.entries()) {
      if (!this.currentTarget) {
        bestThreat = threat[1];
        const entityRef = decodeEntityKey(threat[0]);
        potentialTarget = entityRef;
        continue;
      } else if (threat[1] > bestThreat + switchThreshold) {
        bestThreat = threat[1];
        const entityRef = decodeEntityKey(threat[0]);
        potentialTarget = entityRef;
        continue;
      }
    }

    this.currentTarget = potentialTarget;
    return this.currentTarget;
  }

  public removeEntity(entityRef: EntityRef) {
    this.threatMap.delete(generateEntityKey(entityRef));
    this.updateCurrentTarget();
  }

  public clear() {
    this.threatMap.clear();
    this.currentTarget = null;
  }
}
