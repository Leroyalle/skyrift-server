import type { NpcSessionProps } from '../../domain/types/npc-session.type';

export interface SpawnNpcSessionUseCasePort {
  execute(props: NpcSessionProps): void;
}
