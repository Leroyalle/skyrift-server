interface Props {
  body: string;
  head: string;
}

export class Appearance {
  private constructor(private readonly props: Props) {}

  public static create(payload: Props) {
    return new Appearance(payload);
  }

  public snapshot(): Readonly<Props> {
    return this.props;
  }
}
