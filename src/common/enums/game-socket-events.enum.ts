export enum ServerToClientEvents {
  // TODO: rename to 'connection'
  PlayerConnected = 'player:connected',
  PlayerDisconnected = 'player:disconnected',
  PlayerWalk = 'player:walk',
  PlayerWalkBatch = 'player:walk-batch',
  PlayerResourcesBatch = 'player:resources-batch',
  PlayerStateUpdate = 'player:state-update',
  PlayerChangeLocation = 'player:change-location',
  PlayerAttack = 'player:attack',
  PlayerAttackStart = 'player:attack-start',
  PlayerSkillCooldownUpdate = 'player:skill-cooldown-update',
  PlayerJoined = 'player:joined',
  PlayerLeft = 'player:left',
  PlayerEntered = 'player:entered',
  GameInitialState = 'game:initial-state',
}

export enum ClientToServerEvents {
  PlayerWalk = 'player:walk',
  ChangeLocation = 'player:change-location',
  RequestAttackMove = 'player:request-attack-move',
  RequestUseSkill = 'player:request-use-skill',
  PlayerAttackCancelled = 'player:attack-cancelled',
  RequestInitialState = 'game:request-initial-state',
}
