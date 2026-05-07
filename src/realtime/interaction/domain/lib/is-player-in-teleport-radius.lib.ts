import type { Teleport } from 'src/realtime/location';
import type { PlayerSessionSnapshot } from 'src/realtime/player-session';

export const isPlayerInTeleportArea = (playerState: PlayerSessionSnapshot, teleport: Teleport) => {
  const px = Math.floor(playerState.position.x);
  const py = Math.floor(playerState.position.y);
  const tx = Math.floor(teleport.x);
  const ty = Math.floor(teleport.y);
  return px >= tx && px <= tx + teleport.width && py <= ty && py >= ty - teleport.height;
};
