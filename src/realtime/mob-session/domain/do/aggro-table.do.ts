import { decodeEntityKey } from 'src/realtime/shared/lib/helpers/decode-entity-key.helper';
import { generateEntityKey } from 'src/realtime/shared/lib/helpers/generate-entity-key.helper';
import type { IEntityKey, IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

export class AggroTableDo {
  private currentTarget: IEntityRef | null = null;
  private threatMap = new Map<IEntityKey, number>();

  public get getCurrentTarget() {
    return this.currentTarget;
  }

  public updateThreatMap(entityRef: IEntityRef, damage: number): void {
    const key = generateEntityKey(entityRef);
    const entityThreat = (this.threatMap.get(key) ?? 0) + damage;
    this.threatMap.set(key, entityThreat);
    this.updateCurrentTarget();
  }

  private updateCurrentTarget(switchThreshold: number = 10): IEntityRef | null {
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

  public removeEntity(entityRef: IEntityRef): IEntityRef | null {
    const isTarget =
      this.currentTarget && generateEntityKey(this.currentTarget) === generateEntityKey(entityRef);

    if (isTarget) {
      this.currentTarget = null;
    }
    this.threatMap.delete(generateEntityKey(entityRef));
    return this.updateCurrentTarget();
  }

  public clear(): IEntityRef | null {
    this.threatMap.clear();
    this.currentTarget = null;
    return this.currentTarget;
  }
}
