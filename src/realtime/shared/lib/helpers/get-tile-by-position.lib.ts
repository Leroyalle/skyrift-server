export const getTileByPosition = (pixelX: number, pixelY: number, tileSize: number = 32) => {
  const x = Math.floor(pixelX / tileSize);
  const y = Math.floor(pixelY / tileSize);
  return { x, y };
};
