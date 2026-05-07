export interface LocationPresenceAdapterPort {
  addPlayer(playerId: string, locationId: string): Promise<void>;
  removePlayer(playerId: string, locationId: string): Promise<void>;
  getPlayers(locationId: string): Promise<string[]>;
}
