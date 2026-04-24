import { randomUUID } from 'node:crypto';
import type { AoeZoneRepositoryPort } from 'src/realtime/combat/domain/ports/aoe-zone-repository.port';
import type { AoeZone, SkillEffectConfig } from 'src/realtime/combat/domain/types/aoe-zone.type';
import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import { Inject, Injectable } from '@nestjs/common';

import { AOE_ZONE_REPOSITORY_TOKEN } from '../../ports/tokens';

interface Props {
  casterRef: IEntityRef & { locationId: string };
  stats: {
    skillId: string;
    radius: number;
    duration: number;
    effects: SkillEffectConfig[];
  };
  area: IPositionTile;
  now: number;
}

@Injectable()
export class AoeZoneLifecycleService {
  constructor(
    @Inject(AOE_ZONE_REPOSITORY_TOKEN)
    private readonly aoeZoneRepository: AoeZoneRepositoryPort,
  ) {}

  public spawn(props: Props): Readonly<AoeZone> {
    const zone: AoeZone = {
      casterRef: props.casterRef,
      y: props.area.y,
      x: props.area.x,
      skillId: props.stats.skillId,
      radius: props.stats.radius,
      locationId: props.casterRef.locationId,
      lastUsedAt: 0,
      id: randomUUID(),
      effects: props.stats.effects,
      expiresAt: props.now + props.stats.duration,
    };

    this.aoeZoneRepository.set(zone);

    return zone;
  }

  public despawn(id: string): void {
    this.aoeZoneRepository.remove(id);
  }
}
