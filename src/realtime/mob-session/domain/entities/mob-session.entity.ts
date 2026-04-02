import { AggroTableDo } from '../do/aggro-table.do';
import type { IMobSession, MobSessionSnapshot } from '../types/mob-session.type';

interface MobSessionData extends IMobSession {
  aggroTable: AggroTableDo;
}

export class MobSession {
  private constructor(private readonly props: MobSessionData) {}
  public static create(props: IMobSession) {
    return new MobSession({ ...props, aggroTable: new AggroTableDo() });
  }

  public get mobId() {
    return this.props.mobId;
  }

  public get aggroTable() {
    return this.props.aggroTable;
  }

  public moveTo(x: number, y: number, movedAt: number): void {
    this.ensureAlive();
    this.props.position.x = x;
    this.props.position.y = y;
    this.props.combat.lastMoveAt = movedAt;
  }

  public toPublicSnapshot(): Readonly<MobSessionSnapshot> {
    return {
      appearance: this.props.appearance.snapshot(),
      baseStats: { ...this.props.baseStats },
      combat: { ...this.props.combat },
      position: { ...this.props.position },
      mobId: this.props.mobId,
      name: this.props.name,
      level: this.props.level,
      type: 'mob',
      equipmentId: this.props.equipmentId,
    };
  }

  private ensureAlive(): void {
    if (!this.props.combat.isAlive) {
      throw new Error('Player is dead');
    }
  }
}
