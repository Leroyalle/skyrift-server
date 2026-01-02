import { Injectable } from '@nestjs/common';
import { InteractionType, PendingInteraction } from './types/pending-interactions.type';
import { PlayerStateService } from 'src/game/services/characters/player-state/player-state.service';
import { SocketService } from '../socket/socket.service';
import { LocationService } from 'src/world/location/location.service';
import { Socket } from 'socket.io';
import { RequestUseTeleportDto } from 'src/game/dto/request-use-teleport.dto';
import { verifyUserDataInSocket } from 'src/game/lib/verify-user-data-in-socket.lib';
import { isPlayerInTeleportArea } from 'src/game/lib/teleport/is-player-in-teleport-radius.lib';
import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { SpatialGridService } from '../spatial-grid/spatial-grid.service';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { RedisKeysFactory } from 'src/common/infra/redis-keys-factory.infra';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { CachedLocation } from 'src/world/location/types/cashed-location.type';
import { PositionDto } from 'src/common/dto/position.dto';
import { Teleport } from 'src/world/location/types/teleport.type';
import { PathFindingService } from '../path-finding/path-finding.service';
import { getTileByPosition } from 'src/game/lib/helpers/get-tile-by-position.lib';
import { GameInitialDataService } from '../game-core/game-initial-data/game-initial-data.service';
import { MovementQueueService } from '../movement/services/movement-queue/movement-queue.service';
import { ActionQueueService } from '../combat/services/action-queue/action-queue.service';
import { RuntimeEntityService } from '../runtime-entity/runtime-entity.service';
import { isPlayer } from '../combat/lib/entity/guards/is-player.lib';

@Injectable()
export class InteractionService {
  constructor(
    private readonly runtimeEntityService: RuntimeEntityService,
    private readonly socketService: SocketService,
    private readonly locationService: LocationService,
    private readonly pathFindingService: PathFindingService,
    private readonly spatialGridService: SpatialGridService<IRuntimeCharacter>,
    private readonly redisService: RedisService,
    private readonly gameInitialDataService: GameInitialDataService,
    private readonly movementQueueService: MovementQueueService,
    private readonly actionQueueService: ActionQueueService,
    private readonly playerStateService: PlayerStateService,
  ) {}

  private readonly pendingInteractions = new Map<string, PendingInteraction>();

  public setPendingInteraction(interaction: PendingInteraction) {
    return this.pendingInteractions.set(interaction.characterId, interaction);
  }

  public deletePendingInteraction(characterId: string) {
    return this.pendingInteractions.delete(characterId);
  }

  public async tickInteractions() {
    for (const interaction of this.pendingInteractions.values()) {
      console.log('[tickInteractions]', interaction);
      const playerState = this.runtimeEntityService.getEntityByType(
        'player',
        interaction.characterId,
      );

      if (!playerState || !isPlayer(playerState)) {
        this.deletePendingInteraction(interaction.characterId);
        continue;
      }

      const intType = interaction.type;

      const currentLocation = await this.locationService.loadLocation(playerState.locationId);

      if (!currentLocation) continue;

      switch (intType) {
        case InteractionType.Teleport: {
          const result = await this.resolveTeleport(playerState, interaction, currentLocation);
          if (!result) {
            this.deletePendingInteraction(playerState.id);

            continue;
          }
          break;
        }

        case InteractionType.Talk: {
          const result = await this.resolveTalk(interaction, playerState, currentLocation);
          if (!result) {
            this.deletePendingInteraction(playerState.id);
            continue;
          }
          break;
        }

        default:
          break;
      }
    }
  }

  private async resolveTalk(
    interaction: PendingInteraction,
    playerState: IRuntimeCharacter,
    location: CachedLocation,
  ): Promise<boolean> {
    if (!interaction.targetId) return false;
    const npc = this.runtimeEntityService.getEntityByType('npc', interaction.targetId);

    if (!npc) {
      this.deletePendingInteraction(playerState.id);
      return false;
    }

    const steps = await this.pathFindingService.getPlayerPath(
      playerState.locationId,
      {
        ...getTileByPosition(playerState.x, playerState.y),
      },
      { ...getTileByPosition(npc.x, npc.y) },
      location.passableMap,
    );

    if (!steps) return false;

    if (steps.length > 1) {
      this.movementQueueService.set(playerState, steps);
      return true;
    }

    return true;
  }

  private async resolveTeleport(
    playerState: IRuntimeCharacter,
    interaction: PendingInteraction,
    currentLocation: CachedLocation,
  ): Promise<boolean> {
    if (!interaction.area || !interaction.targetId) return false;

    const teleport = currentLocation.teleportsMap[interaction.targetId];

    if (!teleport) return false;

    if (isPlayerInTeleportArea(playerState, teleport)) {
      console.log('use teleport');
      this.movementQueueService.delete(playerState);
      this.actionQueueService.clearPendingActions(playerState, []);
      this.pendingInteractions.delete(playerState.id);
      await this.useTeleport(playerState, teleport);
    } else {
      console.log('start interaction movement');
      await this.startInteractionMovement(
        playerState,
        {
          x: interaction.area.x,
          y: interaction.area.y,
        },
        currentLocation,
      );
    }

    return true;
  }

  public async requestUseTeleport(client: Socket, input: RequestUseTeleportDto) {
    // FIXME: throw error and disconnect
    if (!verifyUserDataInSocket(client)) {
      this.socketService.notifyDisconnection(client);
      this.socketService.onDisconnect(client);
      return;
    }

    console.log('requestUseTeleport', input);
    const playerState = this.runtimeEntityService.getEntityByType(
      'player',
      client.userData.characterId,
    );

    if (!playerState || !isPlayer(playerState)) return;

    const currentLocation = await this.locationService.loadLocation(playerState.locationId);

    if (!currentLocation) return;

    const teleport = currentLocation.teleportsMap[input.teleportId];

    if (!teleport) return;
    console.log(
      '[requestUseTeleport positions]',
      playerState.x,
      playerState.y,
      teleport.x,
      teleport.y,
      isPlayerInTeleportArea(playerState, teleport),
    );

    if (!isPlayerInTeleportArea(playerState, teleport)) {
      await this.startInteractionMovement(
        playerState,
        { x: input.pointerX, y: input.pointerY },
        currentLocation,
      );

      this.setPendingInteraction({
        characterId: playerState.id,
        type: InteractionType.Teleport,
        area: {
          x: input.pointerX,
          y: input.pointerY,
        },
        targetId: teleport.name,
      });
      return;
    }

    await this.useTeleport(playerState, teleport);
  }

  private async startInteractionMovement(
    playerState: IRuntimeCharacter,
    pixelTarget: PositionDto,
    currentLocation: CachedLocation,
  ) {
    const fromTile = getTileByPosition(playerState.x, playerState.y, currentLocation.tileWidth);

    const targetTile = getTileByPosition(pixelTarget.x, pixelTarget.y, currentLocation.tileWidth);

    // TODO: проверить
    // const prevSteps = this.movementQueueService.get(playerState);
    // if (prevSteps?.steps[-1] === targetTile) return;

    const steps = await this.pathFindingService.getPlayerPath(
      playerState.locationId,
      fromTile,
      targetTile,
      currentLocation.passableMap,
    );

    if (!steps) return;

    this.movementQueueService.set(playerState, steps);

    return steps;
  }

  private async useTeleport(playerState: IRuntimeCharacter, teleport: Teleport) {
    const targetLocation = await this.locationService.loadLocationByFilename(teleport.targetMap);

    console.log('TargetLocation', targetLocation?.name);

    if (!targetLocation) {
      this.pendingInteractions.delete(playerState.id);
      return;
    }

    const client = this.socketService.getSocketByUserId(playerState.userId);

    console.log('client', Boolean(client));
    if (!client || !this.socketService.verifyUserDataInSocket(client)) {
      this.pendingInteractions.delete(playerState.id);
      return;
    }

    this.socketService.broadcastToOthers(
      client,
      RedisKeys.Location + playerState.locationId,
      ServerToClientEvents.PlayerLeft,
      playerState.id,
    );

    await this.redisService.srem(
      RedisKeysFactory.locationPlayers(playerState.locationId),
      playerState.id,
    );

    await this.socketService.leaveTheRoom(
      playerState.userId,
      RedisKeys.Location + playerState.locationId,
    );

    const prevPosition = {
      locationId: playerState.locationId,
      x: playerState.x,
      y: playerState.y,
    };

    this.playerStateService.changeUserLocation(playerState, targetLocation, teleport);

    this.socketService.setClientUserData(
      playerState.userId,
      playerState.id,
      playerState.locationId,
      {
        x: playerState.x,
        y: playerState.y,
      },
    );

    await this.redisService.sadd(
      RedisKeysFactory.locationPlayers(targetLocation.id),
      playerState.id,
    );

    await this.socketService.joinToRoom(playerState.userId, RedisKeys.Location + targetLocation.id);

    this.spatialGridService.update(
      playerState,
      prevPosition.locationId,
      prevPosition.x,
      prevPosition.y,
    );

    const gameInitialData = await this.gameInitialDataService.loadInitialData(
      playerState.id,
      playerState.locationId,
    );

    this.socketService.sendToUser(
      playerState.userId,
      ServerToClientEvents.PlayerChangeLocation,
      gameInitialData,
    );

    this.socketService.broadcastToOthers(
      client,
      RedisKeys.Location + targetLocation.id,
      ServerToClientEvents.PlayerJoined,
      playerState,
    );
  }
}
