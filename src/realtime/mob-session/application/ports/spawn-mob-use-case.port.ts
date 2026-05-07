import type { MobSessionPayload } from '../../domain/types/mob-session.type';

export interface SpawnMobUseCasePort {
  execute(payload: SpawnMobSessionPayload): void;
}

export type SpawnMobSessionPayload = Omit<MobSessionPayload, 'appearance' | 'aggro'> & {
  appearance: { body: string; head: string };
};
