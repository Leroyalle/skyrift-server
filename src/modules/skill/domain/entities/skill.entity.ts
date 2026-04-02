import type { ISkill } from '../types/skill.type';

export class Skill {
  private constructor(private readonly props: ISkill) {}

  public static create(props: ISkill) {
    return new Skill(props);
  }

  public get id() {
    return this.props.id;
  }

  public get cooldownMs() {
    return this.props.cooldownMs;
  }

  public snapshot(): Readonly<ISkill> {
    return { ...this.props };
  }
}
