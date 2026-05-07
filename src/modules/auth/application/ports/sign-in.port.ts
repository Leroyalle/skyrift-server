import { TokenData } from '../types/token-data.type';

export interface SignInPort {
  execute(payload: SignInPayload): Promise<SignInResult>;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignInResult {
  accessToken: TokenData;
  refreshToken: TokenData;
}
