import {
  REQUEST_USE_SKILL_USE_CASE_TOKEN,
  type RequestUseSkillUseCasePort,
} from 'src/realtime/combat';

import { Inject, Injectable } from '@nestjs/common';

import type {
  RequestUseSkillPayload,
  RequestUseSkillPort,
} from '../../ports/actions/request-use-skill.port';

@Injectable()
export class RequestUseSkillUseCase implements RequestUseSkillPort {
  constructor(
    @Inject(REQUEST_USE_SKILL_USE_CASE_TOKEN)
    private readonly requestUseSkillUseCase: RequestUseSkillUseCasePort,
  ) {}

  public async execute(payload: RequestUseSkillPayload) {
    await this.requestUseSkillUseCase.execute({
      attackerRef: { id: payload.characterId, type: 'player' },
      target: payload.target,
      skillId: payload.skillId,
    });
  }
}
