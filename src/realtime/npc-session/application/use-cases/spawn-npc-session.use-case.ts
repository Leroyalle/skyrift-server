import { Appearance } from 'src/common/domain/vo/appearance.vo';

import { Inject, Injectable } from '@nestjs/common';

import { NpcSession } from '../../domain/entities/npc.entity';
import type { NpcSessionRepositoryPort } from '../../domain/ports/npc-session-repository.port';
import type { NpcSessionProps } from '../../domain/types/npc-session.type';
import type { SpawnNpcSessionUseCasePort } from '../ports/spawn-npc-session-use-case.port';
import { NPC_SESSION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class SpawnNpcSessionUseCase implements SpawnNpcSessionUseCasePort {
  constructor(
    @Inject(NPC_SESSION_REPOSITORY_TOKEN)
    private readonly npcSessionRepository: NpcSessionRepositoryPort,
  ) {}

  public execute(props: NpcSessionProps) {
    const npc = NpcSession.create({ ...props, appearance: Appearance.create(props.appearance) });
    this.npcSessionRepository.save(npc);
  }
}
