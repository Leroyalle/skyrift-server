import type { IPositionTile } from 'src/realtime/shared/types/position.type';

export interface PlayerSessionFacadePort {
  move(characterId: string, position: IPositionTile, now: number): void;
  // startAttackByCharacterId(characterId: string, targetId: string, now: number): void;
  // stopAttackByCharacterId(characterId: string): void;
}
