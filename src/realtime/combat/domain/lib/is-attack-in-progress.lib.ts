import type { IPositionTile } from 'src/realtime/shared/types/position.type';

export function isAttackInProgress(
  victimTile: IPositionTile,
  attackDuration: number,
  start: {
    startedAt: number;
    startedTile: IPositionTile;
  },
): boolean {
  const dx = start.startedTile.x - victimTile.x;
  const dy = start.startedTile.y - victimTile.y;
  const distance = Math.hypot(dx, dy);
  const time = distance * attackDuration;
  const gap = Date.now() - start.startedAt;

  return gap < time;
}
