import { PositionDto } from 'src/common/dto/position.dto';
import { EntityRef } from 'src/game/types/entity/entity-ref.type';

export interface IProjectile extends IAttackInitiation {
  // attackerRef: EntityRef;
  victimRef: EntityRef;
  skillId: string | null;
}

export interface IAttackInitiation {
  startedAt: number;
  startedTile: PositionDto;
}
