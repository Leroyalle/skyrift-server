export function getDirection(
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  if (to.x > from.x) return 'right';
  if (to.x < from.x) return 'left';
  if (to.y > from.y) return 'down';
  if (to.y < from.y) return 'up';
  return 'down';
}
