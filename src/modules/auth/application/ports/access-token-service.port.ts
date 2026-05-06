import { SignPayload } from '../types/sign-payload.type';
import { TokenData } from '../types/token-data.type';

export interface AccessTokenPort {
  sign(payload: SignPayload): Promise<TokenData>;
  verify(token: string): Promise<SignPayload>;
}

export interface AccessTokenServicePort {
  sign(payload: SignPayload): Promise<TokenData>;
  verify(token: string): Promise<SignPayload>;
}
