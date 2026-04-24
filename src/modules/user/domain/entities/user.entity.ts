import { IUser, PayloadUser } from '../types/user.type';

export class User {
  private constructor(private readonly props: IUser) {}

  public static create(data: PayloadUser): User {
    return new User({
      id: data.id,
      name: data.name,
      email: data.email,
      password: data.password,
      refreshToken: data.refreshToken,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  public get id() {
    return this.props.id;
  }

  public get email() {
    return this.props.email;
  }

  public get password() {
    return this.props.password;
  }

  public get refreshToken() {
    return this.props.refreshToken;
  }

  public snapshot(): Readonly<IUser> {
    return {
      id: this.props.id,
      name: this.props.name,
      email: this.props.email,
      password: this.props.password,
      refreshToken: this.props.refreshToken,
      createdAt: this.props.createdAt,
      updatedAt: this.props.updatedAt,
    };
  }
}
