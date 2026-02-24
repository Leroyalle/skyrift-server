import { Namespace, Socket } from 'socket.io';
import { PositionDto } from 'src/common/dto/position.dto';
import { ServerToClientEvents } from 'src/common/enums/game-socket-events.enum';
import { PlayerData } from 'src/common/types/player-data.type';

import { Injectable } from '@nestjs/common';

@Injectable()
export class SocketService {
  private server: Namespace | null = null;

  private userIdToSocketId = new Map<string, string>();
  private socketIdToUserId = new Map<string, string>();

  public setServer(server: Namespace) {
    this.server = server;
  }

  public onConnection(socket: Socket, userId: string) {
    this.userIdToSocketId.set(userId, socket.id);
    this.socketIdToUserId.set(socket.id, userId);
  }

  public onDisconnect(socket: Socket) {
    const userId = this.socketIdToUserId.get(socket.id);
    if (userId) {
      this.userIdToSocketId.delete(userId);
    }
    this.socketIdToUserId.delete(socket.id);
    socket.disconnect(true);
  }
  public getAllUserIds() {
    return this.userIdToSocketId.keys();
  }

  // disconnectSocket(socket: Socket) {
  //   socket.disconnect(true);
  // }

  public sendToUser(userId: string, event: ServerToClientEvents, payload: unknown) {
    const socketId = this.userIdToSocketId.get(userId);
    if (!socketId || !this.server) return;
    this.server.to(socketId).emit(event, payload);
  }

  public sendTo(key: string, event: ServerToClientEvents, payload: unknown) {
    if (!this.server) return;
    this.server.to(key).emit(event, payload);
  }

  public broadcast(event: ServerToClientEvents, payload: any) {
    if (!this.server) return;
    this.server.emit(event, payload);
  }

  public broadcastToOthers(
    client: Socket,
    key: string,
    event: ServerToClientEvents,
    payload: unknown,
  ) {
    client.to(key).emit(event, payload);
  }

  public getUserId(socketId: string): string | undefined {
    return this.socketIdToUserId.get(socketId);
  }

  public getSocketId(userId: string): string | undefined {
    return this.userIdToSocketId.get(userId);
  }

  public getSocket(socketId: string) {
    if (!this.server) return;
    return this.server.sockets.get(socketId);
  }

  public getSocketByUserId(userId: string) {
    const socketId = this.getSocketId(userId);
    return socketId ? this.getSocket(socketId) : undefined;
  }

  public async joinToRoom(userId: string, roomId: string) {
    const socketId = this.userIdToSocketId.get(userId);
    if (!socketId) return;
    const socket = this.getSocket(socketId);
    if (!socket) return;
    await socket.join(roomId);
  }

  public async leaveTheRoom(userId: string, roomId: string) {
    const socketId = this.userIdToSocketId.get(userId);
    if (!socketId) return;
    const socket = this.getSocket(socketId);
    if (!socket) return;
    await socket.leave(roomId);
  }

  public setClientUserData(
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

  public verifyUserDataInSocket(client: Socket): client is Socket & {
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

  public notifyDisconnection(client: Socket, message: string = 'Соединение потеряно') {
    client.emit(ServerToClientEvents.PlayerDisconnected, { message });
  }
}
