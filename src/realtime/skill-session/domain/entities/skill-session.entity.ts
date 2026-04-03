import type { ISessionSkill } from '../types/skill-session.type';

export class SessionSkill {
  private constructor(private readonly props: ISessionSkill) {}

  public static create(payload: ISessionSkill) {
    return new SessionSkill(payload);
  }

  public snapshot(): Readonly<ISessionSkill> {
    return { ...this.props };
  }

  public get id() {
    return this.props.id;
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

  public levelUp() {
    if (this.props.level >= 6) throw new Error('Max level reached');
    this.props.level += 1;
  }

  public cooldown(now: number) {
    const cooldownMs = this.props.skill.cooldownMs;
    const cooldownEnd = now + cooldownMs;
    if (now <= this.props.cooldownEnd) throw new Error('Skill is already on cooldown');
    this.props.cooldownEnd = cooldownEnd;
  }
}
