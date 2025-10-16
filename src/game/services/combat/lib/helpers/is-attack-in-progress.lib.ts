import { PositionDto } from 'src/common/dto/position.dto';
import { IAttackInitiation } from '../../services/projectle/types/projectile.type';

export function isAttackInProgress(
  victimTile: PositionDto,
  attackDuration: number,
  start: IAttackInitiation,
): boolean {
  const dx = start.startedTile.x - victimTile.x;
  const dy = start.startedTile.y - victimTile.y;
  const distance = Math.hypot(dx, dy);
  const time = distance * attackDuration;
  const gap = Date.now() - start.startedAt;
  return gap < time;
}
