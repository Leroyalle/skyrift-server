import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

export type RequestUseSkillPayload = {
  skillId: string;
  attackerRef: IEntityRef;
  target: Target;
};

type Target =
  | {
      kind: 'aoe';
      value: IPositionTile;
    }
  | { kind: 'target'; value: IEntityRef };

export interface RequestUseSkillUseCasePort {
  execute(payload: RequestUseSkillPayload): Promise<void>;
}
