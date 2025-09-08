import { LiveCharacterState } from 'src/character/types/live-character-state.type';
import { Teleport } from 'src/location/types/teleport.type';

export const isPlayerInTeleportArea = (
  playerState: LiveCharacterState,
  teleport: Teleport,
) => {
  const px = Math.floor(playerState.x);
  const py = Math.floor(playerState.y);
  const tx = Math.floor(teleport.x);
  const ty = Math.floor(teleport.y);
  return (
    px >= tx &&
    px <= tx + teleport.width &&
    py <= ty &&
    py >= ty - teleport.height
  );
};
