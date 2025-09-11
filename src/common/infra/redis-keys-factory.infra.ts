export class RedisKeysFactory {
  private static readonly _locationPrefix = 'location';
  private static readonly _connectedPlayersPrefix = 'connected-players';
  private static readonly _playerNameToIdPrefix = 'player-name-to-id';
  private static readonly _playersPrefix = 'players';
  private static readonly _statePrefix = 'state';
  private static readonly _chatPrefix = 'chat';
  private static readonly _chatWorldPrefix = 'world';
  private static readonly _chatLocationPrefix = 'location';
  private static readonly _chatDirectPrefix = 'direct';

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

  static playerNameToId(name: string) {
    return `${this._playerNameToIdPrefix}:${name}`;
  }

  static playerState(characterId: string): string {
    return `${this._playersPrefix}:${characterId}:${this._statePrefix}`;
  }

  static chatWorld(): string {
    return `${this._chatPrefix}:${this._chatWorldPrefix}`;
  }

  static chatLocation(locationId: string): string {
    return `${this._chatPrefix}:${this._chatLocationPrefix}:${locationId}`;
  }

  static chatDirect(senderId: string, recipientId: string) {
    return `${this._chatPrefix}:${this._chatDirectPrefix}:${senderId}:${recipientId}`;
  }
}
