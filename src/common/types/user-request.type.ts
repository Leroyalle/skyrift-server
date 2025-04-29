export interface UserRequest extends Request {
  user: PayloadUser;
}

export interface PayloadUser {
  sub: string;
  username: string;
  refreshToken: string;
}
