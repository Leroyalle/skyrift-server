export enum ServerToClientEvents {
  PlayerConnected = 'player:connected',
  PlayerDisconnected = 'player:disconnected',
  PlayerWalk = 'player:walk',
}

export enum ClientToServerEvents {
  PlayerWalk = 'player:walk',
}
