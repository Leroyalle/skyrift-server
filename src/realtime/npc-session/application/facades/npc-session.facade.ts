import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import { Inject, Injectable } from '@nestjs/common';

import type { NpcSessionRepositoryPort } from '../../domain/ports/npc-session-repository.port';
import type { NpcStateStats } from '../../domain/types/npc-session.type';
import type { IReceiveDamageResult } from '../../domain/types/receive-damage-result.type';
import type { NpcSessionFacadePort } from '../ports/npc-session-facade.port';
import { NPC_SESSION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class NpcSessionFacade implements NpcSessionFacadePort {
  constructor(
    @Inject(NPC_SESSION_REPOSITORY_TOKEN)
    private readonly npcSessionRepository: NpcSessionRepositoryPort,
  ) {}

  public findById(id: string) {
    return this.npcSessionRepository.findById(id);
  }

  public move(mobId: string, position: IPositionTile, now: number): void {
    const mobSession = this.npcSessionRepository.findById(mobId);
    if (!mobSession) return;
    mobSession.moveTo(position.x, position.y, now);
    this.npcSessionRepository.save(mobSession);
  }

  public restoreHp(id: string, amount: number, now: number): number | undefined {
    const session = this.npcSessionRepository.findById(id);
    if (!session) return;
    session.restoreHp(amount, now);
    this.npcSessionRepository.save(session);
    return session.hp;
  }

  public applyDamage(id: string, amount: number): IReceiveDamageResult | undefined {
    const session = this.npcSessionRepository.findById(id);
    if (!session) return;

    const result = session.receiveDamage(amount);

    this.npcSessionRepository.save(session);

    return result;
  }

  public cancelAttack(id: string): void {
    const session = this.npcSessionRepository.findById(id);
    if (!session) return;
    session.cancelAttack();
    this.npcSessionRepository.save(session);
  }

  public setState(id: string, state: NpcStateStats): void {
    const session = this.npcSessionRepository.findById(id);
    if (!session) return;
    session.setState(state);
    this.npcSessionRepository.save(session);
  }

  public setLastAttackAt(id: string, lastAttackAt: number): void {
    const session = this.npcSessionRepository.findById(id);
    if (!session) return;
    session.setLastAttackAt(lastAttackAt);
    this.npcSessionRepository.save(session);
  }

  public setMovementLockedUntil(id: string, now: number): void {
    const session = this.npcSessionRepository.findById(id);
    if (!session) return;
    session.setMovementLockedUntil(now);
    this.npcSessionRepository.save(session);
  }
}
