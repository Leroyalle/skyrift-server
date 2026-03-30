import { AggroTableDo } from '../do/aggro-table.do';
import type { IMobSession } from '../types/mob-session.type';

interface MobSessionData extends IMobSession {
  aggroTable: AggroTableDo;
}

export class MobSession {
  private constructor(private readonly props: MobSessionData) {}
  public static create(props: IMobSession) {
    return new MobSession({ ...props, aggroTable: new AggroTableDo() });
  }

  public get id() {
    return this.props.id;
  }

  public get aggroTable() {
    return this.props.aggroTable;
  }
}
