import { Injectable } from '@nestjs/common';
import { InteractionType, PendingInteraction } from './types/pending-interactions.type';
import { PlayerStateService } from 'src/game/services/player-state/player-state.service';
import { SocketService } from '../socket/socket.service';
import { LocationService } from 'src/location/location.service';
import { Socket } from 'socket.io';
import { RequestUseTeleportDto } from 'src/game/dto/request-use-teleport.dto';
import { verifyUserDataInSocket } from 'src/game/lib/verify-user-data-in-socket.lib';
import { isPlayerInTeleportArea } from 'src/game/lib/teleport/is-player-in-teleport-radius.lib';
import { IRuntimeCharacter } from 'src/character/types/runtime-character';
import { SpatialGridService } from '../spatial-grid/spatial-grid.service';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { RedisKeysFactory } from 'src/common/infra/redis-keys-factory.infra';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { CachedLocation } from 'src/location/types/cashed-location.type';
import { PositionDto } from 'src/common/dto/position.dto';
import { Teleport } from 'src/location/types/teleport.type';
import { PathFindingService } from '../path-finding/path-finding.service';
import { getTileByPosition } from 'src/game/lib/helpers/get-tile-by-position.lib';
import { GameInitialDataService } from '../game-core/game-initial-data/game-initial-data.service';
import { MovementQueueService } from '../movement/services/movement-queue/movement-queue.service';
import { ActionQueueService } from '../combat/services/action-queue/action-queue.service';

@Injectable()
export class InteractionService {
  constructor(
    private readonly playerStateService: PlayerStateService,
    private readonly socketService: SocketService,
    private readonly locationService: LocationService,
    private readonly pathFindingService: PathFindingService,
    private readonly spatialGridService: SpatialGridService<IRuntimeCharacter>,
    private readonly redisService: RedisService,
    private readonly gameInitialDataService: GameInitialDataService,
    private readonly movementQueueService: MovementQueueService,
    private readonly actionQueueService: ActionQueueService,
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
      const playerState = this.playerStateService.getCharacterState(interaction.characterId);

      if (!playerState) {
        this.deletePendingInteraction(interaction.characterId);
        continue;
      }

      const intType = interaction.type;

      const currentLocation = await this.locationService.loadLocation(playerState.locationId);

      if (!currentLocation) return;

      switch (intType) {
        case InteractionType.Teleport:
          {
            if (!interaction.area || !interaction.targetId) return;

            const teleport = currentLocation.teleportsMap[interaction.targetId];

            if (!teleport) continue;

            if (isPlayerInTeleportArea(playerState, teleport)) {
              console.log('use teleport');
              this.movementQueueService.delete(playerState);
              this.actionQueueService.clearPendingActions(playerState, []);
              this.pendingInteractions.delete(playerState.id);
              await this.useTeleport(playerState, teleport);
              console.log('teleport used, after use teleport');
              console.log(
                'teleport used, after delete pending interaction',
                this.pendingInteractions.size,
              );

              continue;
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
          }

          break;

        default:
          break;
      }
    }
  }

  public async requestUseTeleport(client: Socket, input: RequestUseTeleportDto) {
    // FIXME: throw error and disconnect
    if (!verifyUserDataInSocket(client)) {
      this.socketService.notifyDisconnection(client);
      this.socketService.onDisconnect(client);
      return;
    }

    console.log('requestUseTeleport', input);
    const playerState = this.playerStateService.getCharacterState(client.userData.characterId);

    if (!playerState) return;

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
    area: PositionDto,
    currentLocation: CachedLocation,
  ) {
    const fromTile = getTileByPosition(playerState.x, playerState.y, currentLocation.tileWidth);

    const targetTile = getTileByPosition(area.x, area.y, currentLocation.tileWidth);

    const prevSteps = this.movementQueueService.get(playerState);

    // const prevSteps = this.movementService.getMovementQueue(
    //   playerState.type,
    //   playerState.id,
    // );

    if (prevSteps?.steps[-1] === targetTile) return;

    const steps = await this.pathFindingService.getPlayerPath(
      playerState.locationId,
      fromTile,
      targetTile,
      currentLocation.passableMap,
    );

    if (!steps) return;

    this.movementQueueService.set(playerState, steps);
    // this.movementService.setMovementQueue(playerState, steps);

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
