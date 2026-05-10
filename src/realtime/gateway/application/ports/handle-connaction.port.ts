import { Socket } from 'socket.io';

export interface HandleConnectionUseCasePort {
  execute(payload: HandleConnectionPayload): Promise<void>;
}

export interface HandleConnectionPayload {
  client: Socket;
}
