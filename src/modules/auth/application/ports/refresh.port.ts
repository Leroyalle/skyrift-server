import { TokenData } from '../types/token-data.type';

export interface RefreshPort {
  execute(userId: string, refreshToken: string): Promise<RefreshResult>;
}

export interface RefreshResult {
  accessToken: TokenData;
  refreshToken: TokenData;
}
