import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { AggroTableDo } from '../do/aggro-table.do';
import type {
  IMobSession,
  MobSessionPayload,
  MobSessionSnapshot,
  MobStateStats,
} from '../types/mob-session.type';
import type { IReceiveDamageResult } from '../types/receive-damage-result.type';

export class MobSession {
  private constructor(private readonly props: IMobSession) {}
  public static create(props: MobSessionPayload): MobSession {
    return new MobSession({
      ...props,
      combat: { ...props.combat, aggro: new AggroTableDo() },
      appearance: props.appearance,
      dirty: false,
      state: {
        current: 'idle',
      },
    });
  }

  public get id() {
    return this.props.id;
  }

  public get hp() {
    return this.props.combat.hp;
  }

  public get locationId() {
    return this.props.position.locationId;
  }

  public get aggroTable() {
    return this.props.combat.aggro;
  }

  public get respawnIn() {
    return this.props.lifecycle.respawnIn;
  }

  public get spawn() {
    return { ...this.props.spawn };
  }

  public get state() {
    return this.props.state.current;
  }

  public get nextThinkAt() {
    return this.props.lifecycle.nextThinkAt;
  }

  public get position() {
    return { ...this.props.position };
  }

  public scheduleNextThinkAt(now: number, delay: number): void {
    this.props.lifecycle.nextThinkAt = now + delay;
  }

  public respawn() {
    this.props.lifecycle.respawnIn = 0;
    this.props.combat.isAlive = true;
    this.props.state.current = 'idle';
    this.props.combat.currentTargetRef = null;
    this.props.combat.hp = this.props.baseStats.maxHp;
  }

  public restoreHp(amount: number, now: number): void {
    this.ensureAlive();
    this.props.combat.hp = Math.min(this.props.combat.hp + amount, this.props.baseStats.maxHp);
    this.props.combat.lastHpRegenerationTime = now;
  }

  public setCurrentTarget(targetRef: IEntityRef): void {
    this.ensureAlive();
    this.props.combat.currentTargetRef = targetRef;
  }

  public updateAggro(entityRef: IEntityRef, amount: number): void {
    this.aggroTable.updateThreatMap(entityRef, amount);
    this.props.lifecycle.nextThinkAt = 1;
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
      this.props.combat.currentTargetRef = null;
    }

    return { hp, isAlive: this.props.combat.isAlive };
  }

  public cancelAttack(): void {
    this.props.combat.currentTargetRef = null;
    this.props.combat.aggro.clear();
    // this.props.state.current = 'idle';
  }

  public toPublicSnapshot(): Readonly<MobSessionSnapshot> {
    return {
      spawn: { ...this.props.spawn },
      lifecycle: { ...this.props.lifecycle },
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
      state: { ...this.props.state },
    };
  }

  private ensureAlive(): void {
    if (!this.props.combat.isAlive) {
      throw new Error('Player is dead');
    }
  }

  public setState(state: MobStateStats): void {
    this.props.state = state;
  }

  public setLastAttackAt(lastAttackAt: number): void {
    this.props.combat.lastAttackAt = lastAttackAt;
  }

  public setMovementLockedUntil(now: number): void {
    this.props.combat.lastMoveAt = now + 200;
  }
}
