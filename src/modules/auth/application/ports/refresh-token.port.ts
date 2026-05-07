import { TokenData } from '../types/token-data.type';

export interface RefreshTokenServicePort {
  generate(): TokenData;
  generateAndHash(): Promise<TokenData>;
  hash(token: string): Promise<string>;
  verify(token: string, hash: string): Promise<boolean>;
  getExpires(days: number): ExpiresData;
}

export interface ExpiresData {
  expiresMs: number;
  expiresDate: Date;
}
