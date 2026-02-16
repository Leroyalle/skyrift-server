export enum ServerToClientEvents {
  PlayerConnected = 'player:connected',
  PlayerDisconnected = 'player:disconnected',
  PlayerResourcesBatch = 'player:resources-batch',
  EntityStateUpdate = 'entity:state-update',
  PlayerChangeLocation = 'player:change-location',
  EntityAttackStart = 'entity:attack-start',
  PlayerSkillCooldownUpdate = 'player:skill-cooldown-update',
  PlayerJoined = 'player:joined',
  PlayerLeft = 'player:left',
  GameInitialState = 'game:initial-state',
  MovementBatch = 'movement-batch',
  AoESpawn = 'aoe:spawn',
  AoERemove = 'aoe:remove',
  ChatWorld = 'chat:world',
  ChatLocation = 'chat:location',
  ChatDirect = 'chat:direct',
  PongTime = 'time:pong',
  KillMob = 'mob:kill',
  RespawnMob = 'mob:respawn',

  BagItemAdded = 'bag:item-added',
  BagItemRemoved = 'bag:item-removed',

  ItemMoved = 'item:moved',

  EquipmentEquipped = 'equipment:equipped',
  EquipmentUnequipped = 'equipment:unequipped',

  GameError = 'game:error',
  GameNotification = 'game:notification',

  QuestList = 'quest:list',
  QuestStarted = 'quest:started',
  QuestCompleted = 'quest:completed',

  LootOpened = 'loot:opened',
  LootItemRemoved = 'loot:removed',
}

export enum ClientToServerEvents {
  PlayerWalk = 'player:walk',
  RequestUseTeleport = 'player:request-use-teleport',
  RequestAttackMove = 'player:request-attack-move',
  RequestUseSkill = 'player:request-use-skill',
  PlayerAttackCancelled = 'player:attack-cancelled',
  RequestInitialState = 'game:request-initial-state',
  PlayerSendWorldMessage = 'player:chat:world:send',
  PlayerSendLocationMessage = 'player:chat:location:send',
  PlayerSendDirectMessage = 'player:chat:direct:send',
  PingTime = 'time:ping',
  RequestBagAdd = 'bag:request-add', // Изменено
  RequestBagRemove = 'bag:request-remove', // Изменено
  RequestEquipItem = 'equipment:request-equip', // Изменено
  RequestUnEquipItem = 'equipment:request-unEquip',
  RequestUseItem = 'bag:request-use-item',

  RequestLoot = 'loot:request-open-loot',
  RequestLootTake = 'loot:request-take',

  RequestAcceptQuest = 'quest:request-accept',
  RequestTurnInQuest = 'quest:request-turn-in',
  RequestAbandonQuest = 'quest:request-abandon',
  RequestTalkToNpc = 'quest:request-talk-to-npc',
}
