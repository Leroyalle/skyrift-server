import type { MobSessionProps } from '../../domain/types/mob-session.type';

export interface SpawnMobUseCasePort {
  execute(payload: MobSessionProps): void;
}
