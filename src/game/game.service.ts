import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { CharacterService } from 'src/character/character.service';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { ChangeLocationDto } from './dto/change-location.dto';
import { LocationService } from 'src/location/location.service';
import { PlayerData } from 'src/common/types/player-data.type';
import { RedisService } from 'src/redis/redis.service';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { mergePassableMaps } from './lib/merge-passable-maps.lib';
import { CachedLocation } from './types/cashed-location.type';
import { RequestMoveToDto } from './dto/request-move-to.dto';
import { TBatchUpdateMovement } from './types/batch-update/batch-update-movement.type';
import { Character } from 'src/character/entities/character.entity';
import { PlayerStateService } from './player-state.service';
import { RedisKeysFactory } from 'src/common/infra/redis-keys-factory.infra';
import { removeCharacterFromSpatialGrid } from './lib/spatial-grid/remove-character-from-spatial-grid.lib';
import { addCharacterToSpatialGrid } from './lib/spatial-grid/add-character-to-spatial-grid.lib';
import { PendingAction } from './types/pending-actions.type';
import { BatchUpdateAction } from './types/batch-update/batch-update-action.type';
import { PathFindingService } from './path-finding/path-finding.service';
import { RequestAttackMoveDto } from './dto/request-attack-move.dto';
import { getPendingActionKey } from './lib/get-pending-action-key';
import { BatchUpdateRegeneration } from './types/batch-update/batch-update-regeneration.type';
import { JwtPayload } from 'src/common/types/jwt-payload.type';

@Injectable()
export class GameService implements OnModuleInit {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly characterService: CharacterService,
    private readonly locationService: LocationService,
    private readonly redisService: RedisService,
    private readonly playerStateService: PlayerStateService,
    private readonly pathFindingService: PathFindingService,
  ) {}

  private server: Namespace;

  setServer(server: Namespace) {
    this.server = server;
  }

  private readonly logger = new Logger(GameService.name);
  private gameTickInterval: NodeJS.Timeout;

  private readonly movementQueues = new Map<
    string,
    { steps: { x: number; y: number }[]; userId: string }
  >();
  private readonly spatialGrid: Map<string, Set<string>> = new Map();
  private readonly pendingActions: Map<string, PendingAction> = new Map();

  private readonly locationCache = new Map<string, CachedLocation>();
  private readonly userIdToSocketId = new Map<string, string>();

  private lastTickTimeMovement = 0;
  private lastTickTimeActions = 0;
  private lastTickTimeRegeneration = 0;

  private readonly intervalMovement = 150;
  private readonly intervalActions = 200;
  private readonly intervalRegeneration = 1000;

  onModuleInit() {
    this.gameTickInterval = setInterval(() => {
      try {
        this.tick();
      } catch (error) {
        this.logger.error(`Error in game tick: ${error.message}`);
      }
    }, 150);
  }

  onModuleDestroy() {
    clearInterval(this.gameTickInterval);
  }

  private async tick() {
    const now = Date.now();

    if (now - this.lastTickTimeMovement >= this.intervalMovement) {
      this.tickMovement();
      this.lastTickTimeMovement = now;
    }
    if (now - this.lastTickTimeActions >= this.intervalActions) {
      await this.tickActions();
      this.lastTickTimeActions = now;
    }

    if (now - this.lastTickTimeRegeneration >= this.intervalRegeneration) {
      this.tickRegeneration();
      this.lastTickTimeRegeneration = now;
    }
  }

  async handleConnection(client: Socket) {
    try {
      const { token: accessToken, characterId } = client.handshake.auth as {
        token?: string;
        characterId?: string;
      };

      if (!accessToken || !characterId) {
        console.log('Disconnect by token or character ID');
        client.disconnect();
        return;
      }

      let payload: JwtPayload;
      try {
        payload = this.authService.verifyToken(accessToken, 'access');
      } catch (e) {
        console.log('Token verification failed', e);
        client.disconnect();
        return;
      }
      const findUser = await this.userService.findOne(payload.sub);
      if (!findUser) {
        console.log('Disconnect by findUser');
        client.disconnect();
        return;
      }

      const findCharacter = await this.characterService.findOwnedCharacter(
        findUser.id,
        characterId,
      );
      if (!findCharacter) {
        console.log('Disconnect by findCharacter');
        client.disconnect();
        return;
      }

      const oldClientId = (await this.redisService.get(
        RedisKeys.ConnectedPlayers + findUser.id,
      )) as string;

      await this.redisService.set(
        RedisKeys.ConnectedPlayers + findUser.id,
        client.id,
      );
      this.userIdToSocketId.set(findUser.id, client.id);

      if (oldClientId) {
        const oldConnection = this.server.sockets.get(oldClientId);
        if (oldConnection && oldConnection.id !== client.id) {
          this.notifyDisconnection(
            oldConnection,
            'Другое устройство подключилось к игре',
          );
          oldConnection.disconnect(true);
        }
      }

      if (!client.userData) {
        client.userData = {};
      }

      client.userData = {
        userId: findUser.id,
        characterId: findCharacter.id,
        locationId: findCharacter.location.id,
        position: {
          x: findCharacter.x,
          y: findCharacter.y,
        },
      };

      await this.playerStateService.join(
        {
          ...findCharacter,
          lastMoveAt: 0,
          lastAttackAt: 0,
          lastHpRegenerationTime: 0,
          locationId: findCharacter.location.id,
          userId: findCharacter.user.id,
          isAttacking: false,
        },
        findCharacter.location.id,
      );

      void client.join(RedisKeys.Location + findCharacter.location.id);
      client.emit(ServerToClientEvents.PlayerConnected, findCharacter);
      this.broadcastPlayerJoined(
        client,
        findCharacter.location.id,
        findCharacter,
      );

      console.log(
        `Client ${client.id} joined location:`,
        findCharacter.location.id,
      );
      // FIXME: send initial data
    } catch (error) {
      console.log('Disconnect by catch in handleConnection', error);
      client.disconnect(true);
    }
  }

  public async handleDisconnect(client: Socket) {
    if (!this.verifyUserDataInSocket(client)) return;

    // FIXME: rework to generateActionKey
    this.pendingActions.delete(client.userData.characterId);

    await this.playerStateService.syncCharacterToDb(
      client.userData.characterId,
    );

    await this.playerStateService.leave(
      client.userData.userId,
      client.userData.characterId,
      client.userData.locationId,
    );

    client
      .to(RedisKeys.Location + client.userData.locationId)
      .emit(ServerToClientEvents.PlayerLeft, client.userData.characterId);
    console.log('Client disconnected:', client.id);
  }

  public broadcastPlayerJoined(
    client: Socket,
    locationId: string,
    character: Character,
  ) {
    client
      .to(RedisKeys.Location + locationId)
      .emit(ServerToClientEvents.PlayerJoined, character);
  }

  // FIXME: replace to handle connection
  public async getInitialData(client: Socket) {
    console.log('initial data to client', client.id);
    if (!this.verifyUserDataInSocket(client)) {
      console.log('Disconnect by verifyUserDataInSocket');
      this.notifyDisconnection(client);
      client.disconnect();
      return;
    }

    const { userId, characterId, locationId } = client['userData'];
    const storedClientId = await this.redisService.get(
      RedisKeys.ConnectedPlayers + userId,
    );

    if (storedClientId !== client.id) {
      this.logger.warn(`Invalid connection for user ${userId}`);
      this.notifyDisconnection(client);
      console.log('Disconnect by storedClientId');
      client.disconnect();
      return;
    }

    const findCharacter = await this.characterService.findOwnedCharacter(
      userId,
      characterId,
    );

    if (!findCharacter) {
      this.notifyDisconnection(client, 'Character not found');
      client.disconnect();
      return;
    }

    const findLocation = await this.loadLocation(locationId);

    if (!findLocation) {
      this.notifyDisconnection(client, 'Location not found');
      client.disconnect();
      return;
    }

    const playersIds = await this.redisService.smembers(
      RedisKeysFactory.locationPlayers(locationId),
    );

    const otherPlayers = playersIds
      .map((id) => this.playerStateService.getCharacterState(id))
      .filter((p) => p && p.id !== characterId);

    void client.join(RedisKeys.Location + findLocation.id);

    client.emit(ServerToClientEvents.GameInitialState, {
      character: findCharacter,
      location: findLocation,
      players: otherPlayers,
    });
  }

  public async requestMoveTo(client: Socket, input: RequestMoveToDto) {
    if (!this.verifyUserDataInSocket(client)) {
      this.notifyDisconnection(client);
      client.disconnect();
      return;
    }

    const { userId, characterId, locationId } = client.userData;

    const character = this.playerStateService.getCharacterState(characterId);
    if (!character) return;

    character.isAttacking = false;

    const findLocation = await this.loadLocation(locationId);

    if (!findLocation) return;
    const map = findLocation?.passableMap;

    if (!map) {
      this.notifyDisconnection(client, 'Location not found');
      client.disconnect();
      return;
    }

    const isPermissible = map[input.targetY][input.targetX] === 1;

    if (!isPermissible) return;

    const steps = await this.pathFindingService.getPlayerPath(
      locationId,
      {
        x: Math.floor(character.x / findLocation.tileWidth),
        y: Math.floor(character.y / findLocation.tileHeight),
      },
      { x: input.targetX, y: input.targetY },
      findLocation.tileWidth,
      map,
    );

    this.movementQueues.set(characterId, { steps, userId });
  }

  public async requestAttackMove(client: Socket, input: RequestAttackMoveDto) {
    if (!this.verifyUserDataInSocket(client)) {
      this.notifyDisconnection(client);
      client.disconnect();
      return;
    }

    const hasSubscribe = this.pendingActions.has(
      getPendingActionKey(
        client.userData.characterId,
        input.targetId,
        'damage',
      ),
    );

    if (hasSubscribe) return;

    await this.schedulePathUpdate(
      client.userData.characterId,
      input.targetId,
      client.userData.userId,
    );
  }

  private async schedulePathUpdate(
    attackerId: string,
    targetId: string,
    attackerUserId: string,
  ) {
    const attacker = this.playerStateService.getCharacterState(attackerId);
    const target = this.playerStateService.getCharacterState(targetId);

    if (!attacker || !target) return;

    this.pendingActions.set(
      getPendingActionKey(attackerId, targetId, 'damage'),
      {
        attackerId,
        victimId: targetId,
        actionType: 'damage',
        state: 'wait-path',
      },
    );

    const findLocation = await this.loadLocation(attacker.locationId);

    if (!findLocation) return;

    const steps = await this.pathFindingService.getPlayerPath(
      findLocation.id,
      {
        x: Math.floor(attacker.x / findLocation.tileWidth),
        y: Math.floor(attacker.y / findLocation.tileHeight),
      },
      {
        x: Math.floor(target.x / findLocation.tileWidth),
        y: Math.floor(target.y / findLocation.tileHeight),
      },
      findLocation.tileWidth,
      findLocation.passableMap,
    );

    console.log('[REQUEST_ATTACK_MOVE] DISTANCE', steps.length);

    if (steps.length === -1) return;

    if (steps.length <= attacker.attackRange) {
      this.pendingActions.set(
        getPendingActionKey(attacker.id, target.id, 'damage'),
        {
          attackerId: attacker.id,
          victimId: target.id,
          actionType: 'damage',
          state: 'attack',
        },
      );

      return;
    }

    this.movementQueues.set(attacker.id, {
      steps: steps.slice(0, steps.length - attacker.attackRange),
      userId: attackerUserId,
    });

    this.pendingActions.set(
      getPendingActionKey(attacker.id, target.id, 'damage'),
      {
        attackerId: attacker.id,
        victimId: target.id,
        actionType: 'damage',
        state: 'move-to-target',
      },
    );
  }

  public async tickActions() {
    const updatesByLocation = new Map<string, BatchUpdateAction[]>();

    for (const action of this.pendingActions.values()) {
      const attacker = this.playerStateService.getCharacterState(
        action.attackerId,
      );

      const victim = this.playerStateService.getCharacterState(action.victimId);

      if (!attacker || !victim) return;

      const location = await this.loadLocation(attacker?.locationId);

      if (!location) return;

      const steps = await this.pathFindingService.getPlayerPath(
        attacker.locationId,
        {
          x: Math.floor(attacker.x / location.tileWidth),
          y: Math.floor(attacker.y / location.tileHeight),
        },
        {
          x: Math.floor(victim.x / location.tileWidth),
          y: Math.floor(victim.y / location.tileHeight),
        },
        location.tileWidth,
        location.passableMap,
      );

      if (steps.length > attacker.attackRange) {
        attacker.isAttacking = false;
        await this.schedulePathUpdate(attacker.id, victim.id, attacker.userId);
        return;
      } else {
        attacker.isAttacking = true;
        console.log('ATTACK', attacker.isAttacking);
        // FIXME: maybe delete this set because we did it in schedulePathUpdate
        this.pendingActions.set(
          getPendingActionKey(attacker.id, victim.id, action.actionType),
          {
            state: 'attack',
            actionType: 'damage',
            attackerId: attacker.id,
            victimId: victim.id,
          },
        );
      }

      const now = Date.now();

      if (now - attacker.lastAttackAt < attacker.attackSpeed) return;

      this.server
        .to(RedisKeys.Location + attacker.locationId)
        .emit(ServerToClientEvents.PlayerAttackStart, {
          attackerId: attacker.id,
          victimId: victim.id,
        });

      const result = this.playerStateService.attack(
        attacker.id,
        victim.id,
        now,
      );

      if (!result) return;

      let batchLocation = updatesByLocation.get(location.id);
      if (!batchLocation) {
        batchLocation = [];
        batchLocation.push(result);
        updatesByLocation.set(location.id, batchLocation);
      }

      if (!result.isAlive) {
        this.pendingActions.delete(
          getPendingActionKey(attacker.id, victim.id, action.actionType),
        );
      }
    }

    for (const [locationId, update] of updatesByLocation.entries()) {
      this.server
        .to(RedisKeys.Location + locationId)
        .emit(ServerToClientEvents.PlayerStateUpdate, update);
    }
  }

  public tickMovement() {
    const updatesByLocation = new Map<string, TBatchUpdateMovement[]>();

    const entries = Array.from(this.movementQueues.entries());

    entries.forEach(([characterId, { steps, userId }]) => {
      const character = this.playerStateService.getCharacterState(characterId);
      if (!character) return;

      const now = Date.now();

      console.log(`tickMovement: ${character.isAttacking}`);
      if (
        now - character.lastMoveAt <
        450
        // ||
        // now - character.lastAttackAt < 450
      )
        return;

      const pathStep = steps.shift();
      if (!pathStep) return;

      const socketId = this.userIdToSocketId.get(userId);
      if (!socketId) return;
      const client = this.server.sockets.get(socketId);

      if (!client) return;
      const prevPosition = client.userData.position;
      const locationId = character.locationId;

      const position = {
        // FIXME: change 32 to tileSize
        x: Math.floor(pathStep.x * 32),
        y: Math.floor(pathStep.y * 32),
      };
      client.userData = { ...client.userData, position };
      this.playerStateService.moveTo(character.id, position, now);

      let updates = updatesByLocation.get(locationId);
      if (!updates) {
        updates = [];
        updatesByLocation.set(locationId, updates);
      }

      updates.push({
        characterId,
        locationId,
        x: position.x,
        y: position.y,
      });

      if (prevPosition) {
        removeCharacterFromSpatialGrid(
          this.spatialGrid,
          characterId,
          locationId,
          prevPosition.x,
          prevPosition.y,
        );
      }

      addCharacterToSpatialGrid(
        this.spatialGrid,
        characterId,
        locationId,
        position.x,
        position.y,
      );

      if (steps.length === 0) {
        this.movementQueues.delete(characterId);
      }
    });
    for (const [locationId, updates] of updatesByLocation.entries()) {
      this.server
        .to(RedisKeys.Location + locationId)
        .emit(ServerToClientEvents.PlayerWalkBatch, updates);
    }
  }

  public requestAttackCancelled(client: Socket, input: RequestAttackMoveDto) {
    if (!this.verifyUserDataInSocket(client)) {
      client.disconnect();
      return;
    }
    const actionKey = getPendingActionKey(
      client.userData.characterId,
      input.targetId,
      'damage',
    );
    if (this.pendingActions.has(actionKey)) {
      console.log('[request attack cancelled], delete action');
      this.pendingActions.delete(actionKey);
    }
  }

  public tickRegeneration() {
    const updatesByLocation = new Map<string, BatchUpdateRegeneration[]>();

    const now = Date.now();

    const characters = this.playerStateService.getCharactersArray();

    characters.forEach((char) => {
      if (now - char.lastHpRegenerationTime < 5000) return;

      if (char.hp >= char.maxHp || !char.isAlive) return;
      const hpDelta = 10;

      char.hp = Math.min(char.hp + hpDelta, char.maxHp);
      char.lastHpRegenerationTime = now;

      let locationBatch = updatesByLocation.get(char.locationId);

      if (!locationBatch) {
        locationBatch = [];
        updatesByLocation.set(char.locationId, locationBatch);
      }

      console.log('tickRegeneration', char.hp, hpDelta);
      locationBatch.push({
        characterId: char.id,
        hp: char.hp,
        hpDelta,
      });
    });

    for (const [locationId, updates] of updatesByLocation.entries()) {
      this.server
        .to(RedisKeys.Location + locationId)
        .emit(ServerToClientEvents.PlayerResourcesBatch, updates);
    }
  }

  public async changeLocation(client: Socket, input: ChangeLocationDto) {
    if (!this.verifyUserDataInSocket(client)) {
      client.disconnect();
      return;
    }
    const {
      userId,
      characterId,
      locationId: oldLocationId,
    } = client['userData'];
    // const storedClientId = this.activeConnections.get(userId);
    const storedClientId = await this.redisService.get(
      RedisKeys.ConnectedPlayers + userId,
    );
    if (storedClientId !== client.id) {
      this.logger.warn(`Invalid connection for user ${userId}`);
      this.notifyDisconnection(client);
      client.disconnect();
      return;
    }

    // TODO: проверить локацию на соседство

    const findLocation = await this.locationService.findOne(
      input.nextLocationId,
    );

    if (!findLocation) {
      client.disconnect();
      return;
    }

    if (findLocation.id === input.nextLocationId) {
      return;
    }

    void client.leave(`location:${oldLocationId}`);
    void client.join(`location:${input.nextLocationId}`);

    this.server
      .to(`location:${oldLocationId}`)
      .emit(ServerToClientEvents.PlayerLeft, {
        characterId,
      });

    this.server
      .to(`location:${input.nextLocationId}`)
      .emit(ServerToClientEvents.PlayerLeft, {
        characterId,
        position: {
          x: 20,
          y: 20,
        },
      });
  }

  private verifyUserDataInSocket(client: Socket): client is Socket & {
    userData: PlayerData;
  } {
    const userData = client.userData;
    console.log('verifyUserDataInSocket', userData);
    if (
      !userData ||
      !userData.userId ||
      !userData.characterId ||
      !userData.locationId ||
      !userData.position
    ) {
      return false;
    }
    return true;
  }

  public notifyDisconnection(
    client: Socket,
    message: string = 'Соединение потеряно',
  ) {
    client.emit(ServerToClientEvents.PlayerDisconnected, { message });
  }

  public async loadLocation(locationId: string) {
    const cachedLocation = this.locationCache.get(locationId);

    if (cachedLocation) return cachedLocation;

    const redisLocation = await this.redisService.get<CachedLocation>(
      RedisKeys.Location + locationId,
    );

    if (redisLocation) {
      this.locationCache.set(locationId, redisLocation);
      return redisLocation;
    }

    const dbLocation = await this.locationService.findOne(locationId);

    if (!dbLocation) return;

    const mergedLocation = {
      ...dbLocation,
      // TODO: сохранять в бд сразу passableMap
      passableMap: mergePassableMaps(dbLocation.layers),
    };

    await this.redisService.set(
      RedisKeys.Location + locationId,
      mergedLocation,
    );

    return mergedLocation;
  }
}
