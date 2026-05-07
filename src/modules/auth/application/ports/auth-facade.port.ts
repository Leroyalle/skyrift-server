import { SignPayload } from '../types/sign-payload.type';

export interface AuthFacadePort {
  verifyAccessToken(token: string): Promise<SignPayload>;
}
