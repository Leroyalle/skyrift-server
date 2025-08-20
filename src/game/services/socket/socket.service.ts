import { Injectable } from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';
import { PositionDto } from 'src/common/dto/position.dto';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { PlayerData } from 'src/common/types/player-data.type';

@Injectable()
export class SocketService {
  private server: Namespace | null = null;

  private userIdToSocketId = new Map<string, string>();
  private socketIdToUserId = new Map<string, string>();

  setServer(server: Namespace) {
    this.server = server;
  }

  onConnection(socket: Socket, userId: string) {
    this.userIdToSocketId.set(userId, socket.id);
    this.socketIdToUserId.set(socket.id, userId);
  }

  onDisconnect(socket: Socket) {
    const userId = this.socketIdToUserId.get(socket.id);
    if (userId) {
      this.userIdToSocketId.delete(userId);
    }
    this.socketIdToUserId.delete(socket.id);
    socket.disconnect(true);
  }

  // disconnectSocket(socket: Socket) {
  //   socket.disconnect(true);
  // }

  sendToUser(userId: string, event: string, payload: unknown) {
    const socketId = this.userIdToSocketId.get(userId);
    if (!socketId || !this.server) return;
    this.server.to(socketId).emit(event, payload);
  }

  sendTo(key: string, event: string, payload: unknown) {
    if (!this.server) return;
    this.server.to(key).emit(event, payload);
  }

  broadcast(event: string, payload: any) {
    if (!this.server) return;
    this.server.emit(event, payload);
  }

  broadcastToOthers(
    client: Socket,
    key: string,
    event: string,
    payload: unknown,
  ) {
    client.to(key).emit(event, payload);
  }

  getUserId(socketId: string): string | undefined {
    return this.socketIdToUserId.get(socketId);
  }

  getSocketId(userId: string): string | undefined {
    return this.userIdToSocketId.get(userId);
  }

  getSocket(socketId: string) {
    if (!this.server) return;
    return this.server.sockets.get(socketId);
  }

  getSocketByUserId(userId: string) {
    const socketId = this.getSocketId(userId);
    return socketId ? this.getSocket(socketId) : undefined;
  }

  joinToRoom(userId: string, roomId: string) {
    const socketId = this.userIdToSocketId.get(userId);
    if (!socketId) return;
    const socket = this.getSocket(socketId);
    if (!socket) return;
    void socket.join(roomId);
  }

  setClientUserData(
    userId: string,
    characterId: string,
    locationId: string,
    position: PositionDto,
  ) {
    const socket = this.getSocketByUserId(userId);

    if (!socket) return;

    if (!socket.userData) {
      socket.userData = {};
    }

    socket.userData = {
      userId,
      characterId,
      locationId,
      position,
    };

    return socket.userData;
  }

  verifyUserDataInSocket(client: Socket): client is Socket & {
    userData: PlayerData;
  } {
    const userData = client.userData;
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
}
