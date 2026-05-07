import type { IOwnedSkill } from '../types/owned-skill.type';

export class OwnedSkill {
  private constructor(private readonly props: IOwnedSkill) {}

  public static create(payload: IOwnedSkill) {
    return new OwnedSkill(payload);
  }

  public snapshot(): Readonly<IOwnedSkill> {
    return { ...this.props };
  }

  public get id() {
    return this.props.id;
  }

  public get skillId() {
    return this.props.skillId;
  }

  public get ownerRef() {
    return this.props.ownerRef;
  }

  public get lastUsedAt() {
    return this.props.lastUsedAt;
  }

  public get cooldownEnd() {
    return this.props.cooldownEnd;
  }
}
