import { PositionDto } from 'src/common/dto/position.dto';
import { ActionType } from 'src/game/types/pending-actions.type';

export function getTargetActionKey(attackerId: string, type: ActionType) {
  return `target:${attackerId}_${type}`;
}

export function getAoEActionKey(
  attackerId: string,
  area: PositionDto,
  type: ActionType,
) {
  return `aoe:${attackerId}_${area.x}_${area.y}_${type}`;
}
