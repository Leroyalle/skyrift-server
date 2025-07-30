export class RedisKeysFactory {
  private static readonly _locationPrefix = 'location';
  private static readonly _connectedPlayersPrefix = 'connected-players';
  private static readonly _playersPrefix = 'players';
  private static readonly _statePrefix = 'state';

  static get locationPrefix(): string {
    return this._locationPrefix;
  }

  static get connectedPlayersPrefix(): string {
    return this._connectedPlayersPrefix;
  }

  static locationPlayers(locationId: string): string {
    return `${this._locationPrefix}:${locationId}:${this._playersPrefix}`;
  }

  static connectedPlayer(playerId: string): string {
    return `${this._connectedPlayersPrefix}:${playerId}`;
  }

  static playerState(playerId: string): string {
    return `${this._playersPrefix}:${playerId}:${this._statePrefix}`;
  }
}
