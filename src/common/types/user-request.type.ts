export interface UserRequest extends Request {
  user: PayloadUser;
}

export interface PayloadUser {
  id: string;
  email: string;
  refreshToken: string;
}
