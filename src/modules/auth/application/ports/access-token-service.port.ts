import { TokenData } from '../types/token-data.type';

export interface AccessTokenPort {
  sign(payload: SignPayload): Promise<TokenData>;
  verify(token: string): Promise<SignPayload>;
}

export interface SignPayload {
  id: string;
  email: string;
}

export interface AccessTokenServicePort {
  sign(payload: SignPayload): Promise<TokenData>;
  verify(token: string): Promise<SignPayload>;
}
