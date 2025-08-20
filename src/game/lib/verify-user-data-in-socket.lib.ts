import { PlayerData } from 'src/common/types/player-data.type';
import { Socket } from 'socket.io';

export function verifyUserDataInSocket(client: Socket): client is Socket & {
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
