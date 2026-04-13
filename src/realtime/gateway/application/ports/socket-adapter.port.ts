import type { Namespace, Socket } from 'socket.io';
import type { ServerToClientEvents } from 'src/realtime/contracts/constants/socket-events.constant';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

export type SocketUserData = {
  userId: string;
  characterId: string;
  locationId: string;
  position: IPositionTile;
};

export interface SocketAdapterPort {
  setServer(server: Namespace): void;

  onConnection(socket: Socket, userId: string): void;
  onDisconnect(socket: Socket): void;

  sendToUser(userId: string, event: ServerToClientEvents, payload: unknown): void;
  sendTo(to: string, event: ServerToClientEvents, payload: unknown): void;
  broadcast(event: ServerToClientEvents, payload: unknown): void;
  broadcastToOthers(
    client: Socket,
    key: string,
    event: ServerToClientEvents,
    payload: unknown,
  ): void;

  getSocket(socketId: string): Socket | undefined;

  joinToRoom(userId: string, roomId: string): Promise<void>;
  leaveTheRoom(userId: string, roomId: string): Promise<void>;

  setClientUserData(SocketUserData): void;
}
