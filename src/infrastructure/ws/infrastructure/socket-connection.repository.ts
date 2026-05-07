import { Injectable } from '@nestjs/common';

@Injectable()
export class SocketConnectionRepository {
  private readonly userIdToSocketId = new Map<string, string>();
  private readonly socketIdToUserId = new Map<string, string>();

  public bind(userId: string, socketId: string): void {
    this.userIdToSocketId.set(userId, socketId);
    this.socketIdToUserId.set(socketId, userId);
  }

  public unbindSocket(socketId: string): void {
    const userId = this.socketIdToUserId.get(socketId);
    if (userId) {
      this.userIdToSocketId.delete(userId);
    }
    this.socketIdToUserId.delete(socketId);
  }

  public getSocketId(userId: string): string | undefined {
    return this.userIdToSocketId.get(userId);
  }

  public getUserId(socketId: string): string | undefined {
    return this.socketIdToUserId.get(socketId);
  }
}
