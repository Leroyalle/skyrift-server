import type { Appearance } from 'src/common/domain/vo/appearance.vo';

import type { IMob } from '../types/mob.type';

type Props = Omit<IMob, 'appearance'> & {
  appearance: Appearance;
};

export class Mob {
  private constructor(private readonly props: Props) {}

  public static create(props: Props) {
    return new Mob(props);
  }

  public get id() {
    return this.props.id;
  }

  public get spawnId() {
    return this.props.spawnId;
  }

  public snapshot(): Readonly<IMob> {
    return {
      ...this.props,
      appearance: this.props.appearance.snapshot(),
    };
  }
}
