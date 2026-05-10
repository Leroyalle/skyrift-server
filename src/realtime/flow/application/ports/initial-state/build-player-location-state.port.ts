import type { GameInitialData } from 'src/realtime/contracts/types/game-initial-data.type';

export interface BuildPlayerLocationStatePort {
  execute(characterId: string, locationId: string): Promise<GameInitialData | undefined>;
}
