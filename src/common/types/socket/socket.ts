import { Socket } from 'socket.io';

import { UnauthenticatedUserData } from './user-data.type';

declare module 'socket.io' {
  interface Socket {
    userData: UnauthenticatedUserData;
  }
}
