import {
  REQUEST_USE_SKILL_USE_CASE_TOKEN,
  type RequestUseSkillUseCasePort,
} from 'src/realtime/combat';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import { Inject, Injectable } from '@nestjs/common';

type RequestUseSkillPayload = {
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

@Injectable()
export class RequestUseSkillUse {
  constructor(
    @Inject(REQUEST_USE_SKILL_USE_CASE_TOKEN)
    private readonly requestUseSkillUseCase: RequestUseSkillUseCasePort,
  ) {}

  public execute(payload: RequestUseSkillPayload) {
    this.requestUseSkillUseCase.execute({
      attackerRef: { id: payload.characterId, type: 'player' },
      target: payload.target,
      skillId: payload.skillId,
    });
  }
}
