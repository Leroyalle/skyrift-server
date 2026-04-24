import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

export interface RequestUseSkillPort {
  execute(payload: RequestUseSkillPayload): void;
}

export type RequestUseSkillPayload = {
  skillId: string;
  characterId: string;
  target: Target;
};

type Target =
  | {
      kind: 'aoe';
      value: IPositionTile;
    }
  | { kind: 'target'; value: IEntityRef };
