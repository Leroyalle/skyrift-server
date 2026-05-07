import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

export type RequestSkillUseDto = {
  skillId: string;
} & ({ area: IPositionTile; type: 'aoe' } | { targetRef: IEntityRef; type: 'target' });
