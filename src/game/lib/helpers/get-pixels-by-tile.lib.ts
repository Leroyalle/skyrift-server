import { PositionDto } from 'src/common/dto/position.dto';

export function getPixelByTile(
  tile: PositionDto,
  tileSize: number = 32,
): PositionDto {
  return { x: Math.floor(tile.x * tileSize), y: Math.floor(tile.y * tileSize) };
}
