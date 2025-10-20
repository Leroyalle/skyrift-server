import { PositionDto } from 'src/common/dto/position.dto';
import { IAttackInitiation } from '../../services/projectile/types/projectile.type';

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
  console.log(
    'gap',
    gap,
    'time',
    time,
    'distance',
    distance,
    'victimTile',
    victimTile,
    'startTile',
    start.startedTile,
    'start.startedAt',
    start.startedAt,
  );
  return gap < time;
}
