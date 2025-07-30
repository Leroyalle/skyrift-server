export function generateSpatialGridKey(
  locationId: string,
  x: number,
  y: number,
): string {
  return `${locationId}_${x}_${y}`;
}
