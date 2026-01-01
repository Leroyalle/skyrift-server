import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { Teleport } from 'src/world/location/types/teleport.type';

export const isPlayerInTeleportArea = (playerState: IRuntimeCharacter, teleport: Teleport) => {
  const px = Math.floor(playerState.x);
  const py = Math.floor(playerState.y);
  const tx = Math.floor(teleport.x);
  const ty = Math.floor(teleport.y);
  return px >= tx && px <= tx + teleport.width && py <= ty && py >= ty - teleport.height;
};
