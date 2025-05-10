import { Socket } from 'socket.io';

declare module 'socket.io' {
  interface Socket {
    userData: {
      userId?: string;
      characterId?: string;
      locationId?: string;
      position?: {
        x: number;
        y: number;
      };
    };
  }
}
