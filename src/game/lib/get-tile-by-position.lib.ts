export const getTileByPosition = (
  pixelX: number,
  pixelY: number,
  tileSize: number,
) => {
  const x = Math.floor(pixelX / tileSize);
  const y = Math.floor(pixelY / tileSize);
  return { x, y };
};
