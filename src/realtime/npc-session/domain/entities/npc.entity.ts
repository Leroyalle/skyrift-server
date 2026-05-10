import type { Appearance } from 'src/common/domain/vo/appearance.vo';

import type {
  INpcSession,
  NpcSessionProps,
  NpcSessionSnapshot,
  NpcStateStats,
} from '../types/npc-session.type';
import type { IReceiveDamageResult } from '../types/receive-damage-result.type';

type CreatePayload = Omit<NpcSessionProps, 'appearance'> & {
  appearance: Appearance;
};

export class NpcSession {
  private constructor(private readonly props: INpcSession) {}

  public static create(props: CreatePayload): NpcSession {
    return new NpcSession({
      ...props,
      state: {
        current: 'idle',
      },
      dirty: false,
    });
  }

  public get id(): string {
    return this.props.id;
  }

  public get hp(): number {
    return this.props.combat.hp;
  }

  public get locationId(): string {
    return this.props.position.locationId;
  }

  public restoreHp(amount: number, now: number): void {
    this.ensureAlive();
    this.props.combat.hp = Math.min(this.props.combat.hp + amount, this.props.baseStats.maxHp);
    this.props.combat.lastHpRegenerationTime = now;
  }

  public toPublicSnapshot(): Readonly<NpcSessionSnapshot> {
    return {
      appearance: this.props.appearance.snapshot(),
      type: 'npc',
      state: { ...this.props.state },
      spawn: { ...this.props.spawn },
      position: { ...this.props.position },
      name: this.props.name,
      level: this.props.level,
      id: this.props.id,
      faction: this.props.faction,
      equipmentId: this.props.equipmentId,
      combat: { ...this.props.combat },
      baseStats: { ...this.props.baseStats },
    };
  }

  public moveTo(x: number, y: number, movedAt: number): void {
    this.ensureAlive();
    this.props.position.x = x;
    this.props.position.y = y;
    this.props.combat.lastMoveAt = movedAt;
  }

  private ensureAlive(): void {
    if (!this.props.combat.isAlive) {
      throw new Error('Player is dead');
    }
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
    this.props.state.current = 'idle';
  }

  public setState(state: NpcStateStats): void {
    this.props.state = state;
  }

  public setLastAttackAt(lastAttackAt: number): void {
    this.props.combat.lastAttackAt = lastAttackAt;
  }

  public setMovementLockedUntil(now: number): void {
    this.props.combat.lastMoveAt = now + 200;
  }
}
