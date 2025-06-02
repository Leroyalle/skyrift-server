export enum ServerToClientEvents {
  PlayerConnected = 'player:connected',
  PlayerDisconnected = 'player:disconnected',
  PlayerWalk = 'player:walk',
  PlayerChangeLocation = 'player:change-location',
  PlayerLeft = 'player:left',
  PlayerEntered = 'player:entered',
  GameInitialState = 'game:initial-state',
}

export enum ClientToServerEvents {
  PlayerWalk = 'player:walk',
  ChangeLocation = 'player:change-location',
  RequestInitialState = 'game:request-initial-state',
}
