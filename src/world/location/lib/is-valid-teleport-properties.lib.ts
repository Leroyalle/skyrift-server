import { TeleportProperties } from '../types/teleportProperties.type';

export const isValidTeleportProperties = (
  properties: TeleportProperties,
): properties is Required<TeleportProperties> => {
  return (
    typeof properties.targetMap === 'string' &&
    typeof properties.targetX === 'number' &&
    typeof properties.targetY === 'number'
  );
};
