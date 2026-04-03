import type { IEffect } from '../types/effect.type';

export class EffectEntity {
  private constructor(private readonly props: IEffect) {}

  public static create(props: IEffect) {
    return new EffectEntity(props);
  }

  public get id() {
    return this.props.id;
  }

  public get type() {
    return this.props.type;
  }

  public snapshot(): Readonly<IEffect> {
    return { ...this.props };
  }
}
