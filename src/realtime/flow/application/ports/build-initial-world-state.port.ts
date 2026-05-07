import { GameInitialData } from 'src/realtime/contracts/types/game-initial-data.type';

export interface BuildInitialWorldStatePort {
  execute(payload: {
    characterId: string;
    userId: string;
    locationId: string;
  }): Promise<GameInitialData>;
}
