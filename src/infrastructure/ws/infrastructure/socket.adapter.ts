import { Namespace, Socket } from 'socket.io';
import { ServerToClientEvents } from 'src/realtime/contracts/constants/socket-events.constant';

import { Injectable } from '@nestjs/common';

import type { SocketAdapterPort, SocketUserData } from '../application/ports/socket-adapter.port';

import { SocketConnectionRepository } from './socket-connection.repository';

@Injectable()
export class SocketAdapter implements SocketAdapterPort {
  private server: Namespace | null = null;

  constructor(private readonly connectionRepository: SocketConnectionRepository) {}

  public setServer(server: Namespace) {
    this.server = server;
  }

  public onConnection(socket: Socket, userId: string) {
    this.connectionRepository.bind(userId, socket.id);
  }

  public onDisconnect(socket: Socket) {
    const userId = this.connectionRepository.getUserId(socket.id);
    if (userId) {
      this.connectionRepository.unbindSocket(socket.id);
    }
  }

  public sendToUser(userId: string, event: ServerToClientEvents, payload: unknown) {
    const socketId = this.connectionRepository.getSocketId(userId);
    if (!socketId || !this.server) return;
    this.server.to(socketId).emit(event, payload);
  }

  public sendTo(to: string, event: ServerToClientEvents, payload: unknown) {
    if (!this.server) return;
    this.server.to(to).emit(event, payload);
  }

  public broadcast(event: ServerToClientEvents, payload: any) {
    if (!this.server) return;
    this.server.emit(event, payload);
  }

  public broadcastToOthers(
    userId: string,
    key: string,
    event: ServerToClientEvents,
    payload: unknown,
  ) {
    const socketId = this.connectionRepository.getSocketId(userId);

    if (!socketId) return;

    const socket = this.getSocket(socketId);

    if (!socket) return;

    socket.to(key).emit(event, payload);
  }

  public getSocket(socketId: string) {
    if (!this.server) return;
    return this.server.sockets.get(socketId);
  }

  public async joinToRoom(userId: string, roomId: string) {
    const socketId = this.connectionRepository.getSocketId(userId);
    if (!socketId) return;
    const socket = this.getSocket(socketId);
    if (!socket) return;
    await socket.join(roomId);
  }

  public async leaveTheRoom(userId: string, roomId: string) {
    const socketId = this.connectionRepository.getSocketId(userId);
    if (!socketId) return;
    const socket = this.getSocket(socketId);
    if (!socket) return;
    await socket.leave(roomId);
  }

  public setClientUserData({ characterId, locationId, position, userId }: SocketUserData) {
    const socketId = this.connectionRepository.getSocketId(userId);

    if (!socketId) return;

    const socket = this.getSocket(socketId);

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
  }
}
