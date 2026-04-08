import type { ISkillSession } from '../types/skill-session.type';

export class SkillSession {
  private constructor(private readonly props: ISkillSession) {}

  public static create(payload: ISkillSession) {
    return new SkillSession(payload);
  }

  public snapshot(): Readonly<ISkillSession> {
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

  public canUse(now: number): boolean {
    if (!this.cooldownEnd) return true;
    return now > this.cooldownEnd;
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
    return cooldownEnd;
  }
}
