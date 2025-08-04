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
import * as EasyStar from 'easystarjs';
import { mergePassableMaps } from './lib/merge-passable-maps.lib';
import { CachedLocation } from './types/cashed-location.type';
import { RequestMoveToDto } from './dto/request-move-to.dto';
import { TBatchUpdateMovement } from './types/batch-update-movement.type';
import { Character } from 'src/character/entities/character.entity';
import { PlayerStateService } from './player-state.service';
import { RedisKeysFactory } from 'src/common/infra/redis-keys-factory.infra';
import { LiveCharacterState } from 'src/character/types/live-character-state.type';
import { parseLiveCharacterState } from './lib/parse-live-character-state.lib';
import { removeCharacterFromSpatialGrid } from './lib/spatial-grid/remove-character-from-spatial-grid.lib';
import { addCharacterToSpatialGrid } from './lib/spatial-grid/add-character-to-spatial-grid.lib';
import { PendingAction } from './types/pending-actions.type';
import { BatchUpdateAction } from './types/batch-update-action.type';
import { PathFindingService } from './path-finding/path-finding.service';
import { RequestAttackMoveDto } from './dto/request-attack-move.dto';
import { validateResultPipeline } from 'src/redis/lib/validate-result-pipeline';
import { getPendingActionKey } from './lib/get-pending-action-key';

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
  private tickMovementInterval: NodeJS.Timeout;
  private tickActionsInterval: NodeJS.Timeout;

  private readonly movementQueues = new Map<
    string,
    { steps: { x: number; y: number }[]; userId: string }
  >();
  private readonly spatialGrid: Map<string, Set<string>> = new Map();
  // TODO: change to Map with unique key
  private readonly pendingActions: Map<string, PendingAction> = new Map();

  private readonly locationCache = new Map<string, CachedLocation>();
  private readonly easyStarInstances = new Map<string, EasyStar.js>();

  onModuleInit() {
    void this.runTickMovement();
    void this.runTickActions();
  }

  private async runTickMovement() {
    try {
      await this.tickMovement();
    } catch (error) {
      this.logger.error(`Error in tickMovement: ${error.message}`);
    } finally {
      this.tickMovementInterval = setTimeout(
        () => void this.runTickMovement(),
        150,
      );
    }
  }

  private async runTickActions() {
    try {
      await this.tickActions();
    } catch (error) {
      this.logger.error(`Error in tickActions: ${error.message}`);
    } finally {
      this.tickActionsInterval = setTimeout(
        () => void this.runTickActions(),
        100,
      );
    }
  }

  onModuleDestroy() {
    clearInterval(this.tickMovementInterval);
    clearInterval(this.tickActionsInterval);
  }

  async handleConnection(client: Socket) {
    try {
      const { token: accessToken, characterId } = client.handshake.auth as {
        token?: string;
        characterId?: string;
      };

      if (!accessToken || !characterId) {
        client.disconnect();
        console.log('Disconnect by token or character ID');
        return;
      }

      let payload;
      try {
        payload = this.authService.verifyToken(accessToken, 'access');
      } catch (e) {
        console.log('Token verification failed', e);
        client.disconnect();
        return;
      }
      const findUser = await this.userService.findOne(payload.sub);
      if (!findUser) {
        client.disconnect();
        console.log('Disconnect by findUser');
        return;
      }

      const findCharacter = await this.characterService.findOwnedCharacter(
        findUser.id,
        characterId,
      );
      if (!findCharacter) {
        client.disconnect();
        console.log('Disconnect by findCharacter');
        return;
      }

      // const oldClientId = this.activeConnections.get(findUser.id);
      const oldClientId = await this.redisService.get(
        RedisKeys.ConnectedPlayers + findUser.id,
      );

      await this.redisService.set(
        RedisKeys.ConnectedPlayers + findUser.id,
        client.id,
      );

      // this.activeConnections.set(findUser.id, client.id);
      console.log('oldClientId', oldClientId, 'newClientId', client.id);

      if (oldClientId && oldClientId !== client.id) {
        console.log('before oldConnection');
        console.log('Sockets keys:', this.server.sockets.keys());
        console.log('oldClientId', oldClientId);

        if (this.server.sockets.has(oldClientId)) {
          const oldConnection = this.server.sockets.get(oldClientId);
          if (oldConnection) {
            if (oldConnection.id === client.id) {
              console.warn('⚠️ Attempting to disconnect self!');
            } else {
              console.log(
                `Disconnecting old client for user ${findUser.id}: ${oldClientId}`,
              );
              console.log('before oldConnection.disconnect');
              this.notifyDisconnection(
                oldConnection,
                'Другое устройство подключилось к игре',
              );
              oldConnection.disconnect(true);
            }
          }
        }
      }

      if (!client.userData) {
        client.userData = {};
        console.log('client.userData is empty', client.userData);
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
      console.log('client.userData', client.userData);

      await this.playerStateService.join(
        { ...findCharacter, locationId: findCharacter.location.id },
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
    } catch {
      console.log('Disconnect by catch in handleConnection');
      client.disconnect(true);
    }
  }

  public async handleDisconnect(client: Socket) {
    if (!this.verifyUserDataInSocket(client)) return;

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

    console.log('[getInitialData] players ids', playersIds);
    const playersKeys = playersIds.map((id) => {
      return RedisKeysFactory.playerState(id);
    });

    console.log('[getInitialData] players keys', playersKeys);

    const pipeline = this.redisService.pipeline();
    for (const player of playersKeys) {
      pipeline.hgetall(player);
    }

    const completedPipeline = await pipeline.exec();

    console.log(completedPipeline);

    if (!completedPipeline) {
      // FIXME: check the error
      throw new Error('Pipeline execution failed');
    }

    const otherPlayers = completedPipeline
      .filter(([err]) => !err)
      .map(([_, player]) =>
        parseLiveCharacterState(player as Record<string, string>),
      );

    console.log('[getInitialData] otherPlayers PIPELINE', otherPlayers);

    // const otherPlayers = (
    //   await this.redisService.mget<LiveCharacterState>(playersKeys)
    // ).filter(Boolean);

    console.log('[getInitialData] otherPlayers', client.id, otherPlayers);
    void client.join(`location:${findLocation?.id}`);

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

    console.log('requestMoveTo', input);

    const { userId, characterId, locationId, position } = client.userData;

    // TODO: optimization
    // const gridKey = generateSpatialGridKey(locationId, position.x, position.y);
    // const victimsSet = this.spatialGrid.get(gridKey);
    // if (victimsSet) {
    //   if (victimsSet.size === 1) {
    //     const [victimId] = victimsSet;
    //     const pipeline = this.redisService.pipeline();
    //     pipeline.hgetall(RedisKeysFactory.playerState(victimId));
    //     pipeline.hgetall(RedisKeysFactory.playerState(characterId));
    //     const result = await pipeline.exec();

    //     if (result && result.length === 2) {
    //       const [victim, attacker] = result
    //         .filter(([err]) => !err)
    //         .map(([_, player]) =>
    //           parseLiveCharacterState(player as Record<string, string>),
    //         );
    //     }

    //     await this.playerStateService.attack(locationId, characterId, victimId);

    //     // TODO: add a check whether you can attack the character
    //   }
    // }

    const findLocation = await this.loadLocation(locationId);
    const map = findLocation?.passableMap;

    if (!map) {
      this.notifyDisconnection(client, 'Location not found');
      client.disconnect();
      return;
    }

    console.log('request move to inpput', input);
    const isPermissible = map[input.targetY][input.targetX] === 1;

    if (!isPermissible) return;

    console.log('[REQUEST_MOVE]', position, input);
    const steps = await this.pathFindingService.getPlayerPath(
      locationId,
      { x: position.x, y: position.y },
      { x: input.targetX, y: input.targetY },
      findLocation.tileWidth,
      map,
    );

    console.log('steps', steps);

    this.movementQueues.set(characterId, { steps, userId });
    console.log(
      `[REQUEST MOVE TO STEPS]`,
      this.movementQueues.get(characterId),
    );
  }

  public async requestAttackMove(client: Socket, input: RequestAttackMoveDto) {
    if (!this.verifyUserDataInSocket(client)) {
      this.notifyDisconnection(client);
      client.disconnect();
      return;
    }

    const pipeline = this.redisService.pipeline();

    pipeline.hgetall(RedisKeysFactory.playerState(client.userData.characterId));
    pipeline.hgetall(RedisKeysFactory.playerState(input.targetId));

    const result = await pipeline.exec();

    if (!result) return;

    const [attacker, target] = validateResultPipeline(result);

    if (!attacker || !target) return;

    const findLocation = await this.loadLocation(attacker.locationId);

    if (!findLocation) return;

    const distance = await this.pathFindingService.getPathDistance(
      attacker.locationId,
      {
        x: Math.floor(attacker.x / findLocation.tileWidth),
        y: Math.floor(attacker.y / findLocation.tileHeight),
      },
      {
        x: Math.floor(target.x / findLocation.tileWidth),
        y: Math.floor(target.y / findLocation.tileHeight),
      },
      findLocation.passableMap,
    );

    console.log('[REQUEST_ATTACK_MOVE] DISTANCE', distance);

    if (distance === -1) return;

    if (distance <= attacker.attackRange) {
      const ts = new Date();
      this.pendingActions.set(
        getPendingActionKey(attacker.id, target.id, 'attack', ts),
        {
          attackerId: attacker.id,
          victimId: target.id,
          type: 'attack',
          ts,
        },
      );
    } else {
      const steps = await this.pathFindingService.getPlayerPath(
        findLocation.id,
        {
          x: attacker.x,
          y: attacker.y,
        },
        {
          x: Math.floor(target.x / findLocation.tileWidth),
          y: Math.floor(target.y / findLocation.tileHeight),
        },
        findLocation.tileWidth,
        findLocation.passableMap,
      );

      this.movementQueues.set(attacker.id, {
        steps,
        userId: client.userData.userId,
      });
    }
  }

  public async tickActions() {
    const updatesByLocation = new Map<string, BatchUpdateAction[]>();
    const pipelineForState = this.redisService.pipeline();

    this.pendingActions.forEach((action) => {
      console.log('[tick_actions]', action);
      pipelineForState.hgetall(RedisKeysFactory.playerState(action.attackerId));
      pipelineForState.hgetall(RedisKeysFactory.playerState(action.victimId));
    });

    const result = await pipelineForState.exec();

    if (!result) return;

    const pairedPlayers: {
      victim: LiveCharacterState;
      attacker: LiveCharacterState;
      action: PendingAction;
    }[] = [];

    for (let i = 0; i < result.length; i += 2) {
      const [errA, rawA] = result[i];
      const [errV, rawV] = result[i + 1];
      const action = Array.from(this.pendingActions.values())[
        i > 0 ? i / 2 : 0
      ];
      console.log(
        `[for_loop]`,
        i,
        Array.from(this.pendingActions.values())[i > 0 ? i / 2 : 0],
        Array.from(this.pendingActions.values()),
      );

      if (errA || errV) continue;

      const attacker = parseLiveCharacterState(rawA as Record<string, string>);
      const victim = parseLiveCharacterState(rawV as Record<string, string>);

      if (attacker && victim) {
        console.log(`[before paired push]`, this.pendingActions, {
          attacker,
          victim,
          action,
        });
        pairedPlayers.push({ attacker, victim, action });
      }
    }

    const pipelineForHpUpdate = this.redisService.pipeline();

    pairedPlayers.forEach(({ attacker, victim, action }) => {
      // TODO: calculate received damage with defense and other stats
      const receivedDamage = attacker.basePhysicalDamage;
      console.log('receivedDamage', receivedDamage);
      const remainingHp = Math.max(victim.hp - receivedDamage, 0);
      pipelineForHpUpdate.hset(RedisKeysFactory.playerState(victim.id), {
        hp: remainingHp,
      });

      let locationBatch = updatesByLocation.get(attacker.locationId);

      if (!locationBatch) {
        locationBatch = [];
        updatesByLocation.set(attacker.locationId, locationBatch);
      }

      locationBatch.push({
        characterId: victim.id,
        hp: remainingHp,
        isAlive: remainingHp > 0,
        receivedDamage,
      });

      // console.log('[before get pending key]', { attacker, victim, action });

      this.pendingActions.delete(
        getPendingActionKey(attacker.id, victim.id, action.type, action.ts),
      );
    });

    await pipelineForHpUpdate.exec();

    for (const [locationId, update] of updatesByLocation.entries()) {
      this.server
        .to(RedisKeys.Location + locationId)
        .emit(ServerToClientEvents.PlayerStateUpdate, update);
    }
  }

  public async tickMovement() {
    // TODO: add pipeline for movement players
    const updatesByLocation = new Map<string, TBatchUpdateMovement[]>();

    const entries = Array.from(this.movementQueues.entries());
    const userIds = entries.map(([, { userId }]) => userId);

    if (userIds.length === 0) return;

    const redisKeys = userIds.map((id) => RedisKeys.ConnectedPlayers + id);
    const socketIds = await this.redisService.mget<string>(redisKeys);
    const userIdToSocketId = new Map<string, string>();

    const pipelineForPlayersStates = this.redisService.pipeline();

    entries.forEach(([characterId]) => {
      pipelineForPlayersStates.hgetall(
        RedisKeysFactory.playerState(characterId),
      );
    });

    const result = await pipelineForPlayersStates.exec();

    if (!result) return;

    const playersStates = new Map<string, LiveCharacterState>();

    result
      .filter(([e]) => !e)
      .forEach(([_, p]) => {
        const player = parseLiveCharacterState(p as Record<string, string>);
        playersStates.set(player.id, player);
      });

    for (let i = 0; i < userIds.length; i++) {
      if (socketIds[i]) {
        userIdToSocketId.set(userIds[i], socketIds[i]!);
      }
    }

    const pipelineForSetPosition = this.redisService.pipeline();

    for (const [
      characterId,
      { steps, userId },
    ] of this.movementQueues.entries()) {
      const step = steps.shift();
      if (!step) {
        this.movementQueues.delete(characterId);
        continue;
      }

      const socketId = userIdToSocketId.get(userId);
      if (!socketId) continue;

      // FIXME: change to redis
      const client = this.server.sockets.get(socketId);
      if (!client) continue;

      const userData = client.userData;
      const locationId = userData?.locationId;
      const prevPosition = userData.position;
      if (!locationId) continue;

      const position = {
        // FIXME: change 32 to tileSize
        x: Math.floor(step.x * 32),
        y: Math.floor(step.y * 32),
      };
      client.userData = { ...userData, position };

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

      pipelineForSetPosition.hset(RedisKeysFactory.playerState(characterId), {
        x: position.x,
        y: position.y,
      });

      // TODO: add spatial grid to redis
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
    }

    await pipelineForSetPosition.exec();

    for (const [locationId, updates] of updatesByLocation.entries()) {
      this.server
        .to(RedisKeys.Location + locationId)
        .emit(ServerToClientEvents.PlayerWalkBatch, updates);
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
