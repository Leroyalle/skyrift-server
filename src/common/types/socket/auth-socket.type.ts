import { Socket } from 'socket.io';

export type AuthenticatedSocket = Socket & {
  userData: {
    userId: string;
    characterId: string;
    locationId: string;
    position: { x: number; y: number };
  };
};
