import type { PlayerSessionSnapshot } from '../../domain/types/player-session.type';
import type { ConnectPlayerPayload } from '../types/connect-player-payload.type';

export interface ConnectPlayerUseCasePort {
  execute(data: ConnectPlayerPayload): Promise<PlayerSessionSnapshot>;
}
