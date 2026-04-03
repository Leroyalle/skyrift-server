import { randomUUID } from 'node:crypto';
import { CLOCK_TOKEN, type ClockPort } from 'src/realtime/shared/infrastructure/time';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import { Inject, Injectable } from '@nestjs/common';

import type { AoeZoneRepositoryPort } from '../../domain/ports/aoe-zone-repository.port';
import type { SkillEffectConfig } from '../../domain/types/aoe-zone.type';
import { AOE_ZONE_REPOSITORY_TOKEN } from '../ports/tokens';

interface Props {
  casterRef: IEntityRef & { locationId: string };
  stats: {
    skillId: string;
    radius: number;
    duration: number;
    effects: SkillEffectConfig[];
  };
  area: IPositionTile;
}

@Injectable()
export class SpawnAoEZoneUseCase {
  constructor(
    @Inject(AOE_ZONE_REPOSITORY_TOKEN)
    private readonly aoeZoneRepository: AoeZoneRepositoryPort,
    @Inject(CLOCK_TOKEN) private readonly clockService: ClockPort,
  ) {}

  public execute(props: Props) {
    this.aoeZoneRepository.set({
      casterRef: props.casterRef,
      y: props.area.y,
      x: props.area.x,
      skillId: props.stats.skillId,
      radius: props.stats.radius,
      locationId: props.casterRef.locationId,
      lastUsedAt: 0,
      id: randomUUID(),
      effects: props.stats.effects,
      expiresAt: this.clockService.nowMs() + props.stats.duration,
    });
  }
}
