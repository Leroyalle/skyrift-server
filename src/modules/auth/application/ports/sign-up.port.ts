import { TokenData } from '../types/token-data.type';

export interface SignUpPayload {
  name: string;
  email: string;
  password: string;
}

export interface SignUpPort {
  execute(payload: SignUpPayload): Promise<SignUpResult>;
}

export interface SignUpResult {
  accessToken: TokenData;
  refreshToken: TokenData;
}
