import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { AggroTableDo } from '../do/aggro-table.do';
import type { IMobSession, MobSessionSnapshot } from '../types/mob-session.type';
import type { IReceiveDamageResult } from '../types/receive-damage-result.type';

interface MobSessionData extends IMobSession {
  aggroTable: AggroTableDo;
}

export class MobSession {
  private constructor(private readonly props: MobSessionData) {}
  public static create(props: IMobSession) {
    return new MobSession({ ...props, aggroTable: new AggroTableDo() });
  }

  public get mobId() {
    return this.props.id;
  }

  public get aggroTable() {
    return this.props.aggroTable;
  }

  public updateAggro(entityRef: IEntityRef, amount: number): void {
    this.aggroTable.updateThreatMap(entityRef, amount);
  }

  public moveTo(x: number, y: number, movedAt: number): void {
    this.ensureAlive();
    this.props.position.x = x;
    this.props.position.y = y;
    this.props.combat.lastMoveAt = movedAt;
  }

  public receiveDamage(amount: number): IReceiveDamageResult {
    if (!this.props.combat.isAlive) {
      return {
        hp: this.props.combat.hp,
        isAlive: this.props.combat.isAlive,
      };
    }

    const hp = Math.min(Math.max(0, this.props.combat.hp - amount), this.props.baseStats.maxHp);

    this.props.combat.hp = hp;

    if (this.props.combat.hp === 0) {
      this.props.combat.isAlive = false;
      this.props.combat.currentTargetId = null;
    }

    return { hp, isAlive: this.props.combat.isAlive };
  }

  public toPublicSnapshot(): Readonly<MobSessionSnapshot> {
    return {
      appearance: this.props.appearance.snapshot(),
      baseStats: { ...this.props.baseStats },
      combat: { ...this.props.combat },
      position: { ...this.props.position },
      id: this.props.id,
      name: this.props.name,
      level: this.props.level,
      type: 'mob',
      equipmentId: this.props.equipmentId,
      faction: this.props.faction,
    };
  }

  private ensureAlive(): void {
    if (!this.props.combat.isAlive) {
      throw new Error('Player is dead');
    }
  }
}
