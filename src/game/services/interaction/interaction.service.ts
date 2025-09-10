import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  InteractionType,
  PendingInteraction,
} from './types/pending-interactions.type';
import { PlayerStateService } from 'src/game/services/player-state/player-state.service';
import { SocketService } from '../socket/socket.service';
import { LocationService } from 'src/location/location.service';
import { Socket } from 'socket.io';
import { RequestUseTeleportDto } from 'src/game/dto/request-use-teleport.dto';
import { verifyUserDataInSocket } from 'src/game/lib/verify-user-data-in-socket.lib';
import { isPlayerInTeleportArea } from 'src/game/lib/teleport/is-player-in-teleport-radius.lib';
import { LiveCharacter } from 'src/character/types/live-character-state.type';
import { SpatialGridService } from '../spatial-grid/spatial-grid.service';
import { MovementService } from '../movement/movement.service';
import { RedisService } from 'src/redis/redis.service';
import { RedisKeysFactory } from 'src/common/infra/redis-keys-factory.infra';
import { RedisKeys } from 'src/common/enums/redis-keys.enum';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { CombatService } from '../combat/combat.service';
import { CachedLocation } from 'src/location/types/cashed-location.type';
import { PositionDto } from 'src/common/dto/position.dto';
import { Teleport } from 'src/location/types/teleport.type';
import { PathFindingService } from '../path-finding/path-finding.service';

@Injectable()
export class InteractionService {
  constructor(
    private readonly playerStateService: PlayerStateService,
    private readonly socketService: SocketService,
    private readonly locationService: LocationService,
    private readonly pathFindingService: PathFindingService,
    private readonly spatialGridService: SpatialGridService<LiveCharacter>,
    private readonly redisService: RedisService,
    @Inject(forwardRef(() => MovementService))
    private readonly movementService: MovementService,
    @Inject(forwardRef(() => CombatService))
    private readonly combatService: CombatService,
  ) {}

  private readonly pendingInteractions = new Map<string, PendingInteraction>();

  setPendingInteraction(interaction: PendingInteraction) {
    return this.pendingInteractions.set(interaction.characterId, interaction);
  }

  deletePendingInteraction(characterId: string) {
    return this.pendingInteractions.delete(characterId);
  }

  async tickInteractions() {
    for (const interaction of this.pendingInteractions.values()) {
      console.log('[tickInteractions]', interaction);
      const playerState = this.playerStateService.getCharacterState(
        interaction.characterId,
      );

      if (!playerState) {
        this.deletePendingInteraction(interaction.characterId);
        continue;
      }

      const intType = interaction.type;

      const currentLocation = await this.locationService.loadLocation(
        playerState.locationId,
      );

      if (!currentLocation) return;

      switch (intType) {
        case InteractionType.Teleport:
          {
            if (!interaction.area || !interaction.targetId) return;

            const teleport = currentLocation.teleportsMap[interaction.targetId];

            if (!teleport) continue;

            console.log(
              '[tick interactions positions]',
              Math.floor(playerState.x),
              Math.floor(playerState.y),
              Math.floor(teleport.x),
              Math.floor(teleport.y),
              teleport.width,
              teleport.height,
              isPlayerInTeleportArea(playerState, teleport),
            );

            if (isPlayerInTeleportArea(playerState, teleport)) {
              console.log('use teleport');
              this.movementService.deleteMovementQueue(playerState.id);
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
                { x: interaction.area.x, y: interaction.area.y },
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

  public async requestUseTeleport(
    client: Socket,
    input: RequestUseTeleportDto,
  ) {
    // FIXME: throw error and disconnect
    if (!verifyUserDataInSocket(client)) {
      this.socketService.notifyDisconnection(client);
      this.socketService.onDisconnect(client);
      return;
    }

    console.log('requestUseTeleport', input);
    const playerState = this.playerStateService.getCharacterState(
      client.userData.characterId,
    );

    if (!playerState) return;

    const currentLocation = await this.locationService.loadLocation(
      playerState.locationId,
    );

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
    playerState: LiveCharacter,
    area: PositionDto,
    currentLocation: CachedLocation,
  ) {
    const fromTile = this.spatialGridService.getTileByPosition(
      playerState.x,
      playerState.y,
    );

    const targetTile = this.spatialGridService.getTileByPosition(
      area.x,
      area.y,
    );
    const prevSteps = this.movementService.getMovementQueue(playerState.id);

    if (prevSteps?.steps[-1] === targetTile) return;

    const steps = await this.pathFindingService.getPlayerPath(
      playerState.locationId,
      fromTile,
      targetTile,
      currentLocation.tileWidth,
      currentLocation.passableMap,
    );

    this.movementService.setMovementQueue(playerState.id, {
      steps,
      userId: playerState.userId,
    });

    return steps;
  }

  private async useTeleport(playerState: LiveCharacter, teleport: Teleport) {
    const targetLocation = await this.locationService.loadLocationByFilename(
      teleport.targetMap,
    );

    console.log('TargetLocation', targetLocation?.name);

    if (!targetLocation) {
      this.pendingInteractions.delete(playerState.id);
      return;
    }

    const client = this.socketService.getSocketByUserId(playerState.userId);

    console.log('client', Boolean(client));
    if (!client) {
      this.pendingInteractions.delete(playerState.id);
      return;
    }

    const playersIds = await this.redisService.smembers(
      RedisKeysFactory.locationPlayers(targetLocation.id),
    );

    console.log('playersIds', playersIds);

    const otherPlayers = playersIds
      .filter((id) => id !== playerState.id)
      .map((id) => this.playerStateService.getCharacterState(id));

    const aoeZones = this.combatService.getActiveAoeZones();

    this.socketService.leaveTheRoom(
      playerState.userId,
      RedisKeys.Location + playerState.locationId,
    );

    const prevPosition = {
      locationId: playerState.locationId,
      x: playerState.x,
      y: playerState.y,
    };

    console.log('[useTeleport] prevPosition', prevPosition);

    this.socketService.joinToRoom(
      playerState.userId,
      RedisKeys.Location + targetLocation.id,
    );

    await this.redisService.srem(
      RedisKeysFactory.locationPlayers(playerState.locationId),
      playerState.id,
    );

    await this.redisService.sadd(
      RedisKeysFactory.locationPlayers(targetLocation.id),
      playerState.id,
    );

    this.playerStateService.changeUserLocation(
      playerState,
      targetLocation,
      teleport,
      client,
    );

    console.log(
      '[useTeleport] playerState',
      playerState.locationId,
      playerState.x,
      playerState.y,
    );

    this.spatialGridService.update(
      playerState,
      prevPosition.locationId,
      prevPosition.x,
      prevPosition.y,
    );

    // this.socketService.sendToUser(
    //   playerState.userId,
    //   ServerToClientEvents.PlayerConnected,
    //   playerState,
    // );

    this.socketService.broadcastToOthers(
      client,
      RedisKeys.Location + playerState.locationId,
      ServerToClientEvents.PlayerJoined,
      playerState,
    );

    this.socketService.sendToUser(
      playerState.userId,
      ServerToClientEvents.PlayerUseTeleport,
      {
        character: playerState,
        location: targetLocation,
        players: otherPlayers,
        aoeZones,
      },
    );
  }
}
