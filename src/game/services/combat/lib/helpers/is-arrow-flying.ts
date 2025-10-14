import { PositionDto } from 'src/common/dto/position.dto';

export function isArrowFlying(
  victimPosition: PositionDto,
  attackDuration: number,
  start: {
    startedAt: number;
    startedTile: PositionDto;
  },
): boolean {
  const dx = start.startedTile.x - victimPosition.x;
  const dy = start.startedTile.y - victimPosition.y;
  const distance = Math.hypot(dx, dy);
  const time = distance * attackDuration;
  const gap = Date.now() - start.startedAt;
  return gap < time;
}
