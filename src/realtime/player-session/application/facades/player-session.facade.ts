import type { StateStats } from 'src/common/domain/types/runtime-stats.type';
import type { PositionDto } from 'src/common/dto/position.dto';
import { CLOCK_TOKEN, type ClockPort } from 'src/realtime/shared/infrastructure/time';
import { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import { Inject, Injectable } from '@nestjs/common';

import type { PlayerSessionRepositoryPort } from '../../domain/ports/in-memory-player-session-repository.port';
import type { IReceiveDamageResult } from '../../domain/types/receive-damage-result.type';
import type { PlayerSessionFacadePort, SkillCombatSpec } from '../ports/player-session-facade.port';
import { PLAYER_SESSION_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class PlayerSessionFacade implements PlayerSessionFacadePort {
  constructor(
    @Inject(CLOCK_TOKEN) private readonly clockService: ClockPort,
    @Inject(PLAYER_SESSION_REPOSITORY_TOKEN)
    private readonly playerSessionRepository: PlayerSessionRepositoryPort,
  ) {}

  public move(characterId: string, position: PositionDto, now: number): void {
    const session = this.playerSessionRepository.findById(characterId);
    if (!session) return;
    session.moveTo(position.x, position.y, now);
    this.playerSessionRepository.save(session);
  }

  public setCurrentTarget(id: string, targetRef: IEntityRef): void {
    const session = this.playerSessionRepository.findById(id);
    if (!session) return;
    session.setCurrentTarget(targetRef);
    this.playerSessionRepository.save(session);
  }

  public restoreHp(id: string, amount: number, now: number): number | undefined {
    const session = this.playerSessionRepository.findById(id);
    if (!session) return;
    session.restoreHp(amount, now);
    this.playerSessionRepository.save(session);
    return session.hp;
  }

  public applyDamage(characterId: string, amount: number): IReceiveDamageResult | undefined {
    const session = this.playerSessionRepository.findById(characterId);

    if (!session) return;

    const result = session.receiveDamage(amount);

    this.playerSessionRepository.save(session);

    return result;
  }

  public canUseSkill(skillId: string): boolean {
    const session = this.playerSessionRepository.findById(skillId);
    if (!session) return false;
    const skill = session.getSkill(skillId);
    return skill.canUse(this.clockService.nowMs());
  }

  public getSkillCombatSpec(id: string, skillId: string): SkillCombatSpec | null {
    const session = this.playerSessionRepository.findById(id);
    if (!session) return null;
    const skill = session.getSkill(skillId).snapshot();
    return {
      id: skill.id,
      lastUsedAt: skill.lastUsedAt,
      cooldownEnd: skill.cooldownEnd,
      cooldownMs: skill.skill.cooldownMs,
      skillId,
      type: skill.skill.type,
      magnitude: skill.skill.damagePerSecond,
      areaRadius: skill.skill.areaRadius,
      duration: skill.skill.duration,
      range: skill.skill.range,
    };
  }

  public cancelAttack(id: string): void {
    const session = this.playerSessionRepository.findById(id);
    if (!session) return;
    session.cancelAttack();
    this.playerSessionRepository.save(session);
  }

  public setState(id: string, state: StateStats): void {
    const session = this.playerSessionRepository.findById(id);
    if (!session) return;
    session.setState(state);
    this.playerSessionRepository.save(session);
  }

  public setLastAttackAt(id: string, lastAttackAt: number): void {
    const session = this.playerSessionRepository.findById(id);
    if (!session) return;
    session.setLastAttackAt(lastAttackAt);
    this.playerSessionRepository.save(session);
  }

  public applySkillCooldown(id: string, skillId: string, now: number): number | undefined {
    const session = this.playerSessionRepository.findById(id);
    if (!session) return;
    return session.applySkillCooldown(skillId, now);
  }

  public setMovementLockedUntil(id: string, now: number): void {
    const session = this.playerSessionRepository.findById(id);
    if (!session) return;
    session.setMovementLockedUntil(now);
    this.playerSessionRepository.save(session);
  }

  public changeLocation(id: string, x: number, y: number, locationId: string): void {
    const session = this.playerSessionRepository.findById(id);
    if (!session) return;
    session.changeLocation(x, y, locationId);
    this.playerSessionRepository.save(session);
  }
}
