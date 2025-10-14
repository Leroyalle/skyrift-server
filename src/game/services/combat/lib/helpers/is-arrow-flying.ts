import { PositionDto } from 'src/common/dto/position.dto';
import { TAttackInitiation } from 'src/game/types/pending-actions.type';

export function isArrowFlying(
  victimTile: PositionDto,
  attackDuration: number,
  start: TAttackInitiation,
): boolean {
  const dx = start.startedTile.x - victimTile.x;
  const dy = start.startedTile.y - victimTile.y;
  const distance = Math.hypot(dx, dy);
  const time = distance * attackDuration;
  const gap = Date.now() - start.startedAt;
  return gap < time;
}
