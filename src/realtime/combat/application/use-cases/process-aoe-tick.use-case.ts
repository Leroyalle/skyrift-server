import {
  EQUIPMENT_CONTAINER_FACADE_TOKEN,
  type EquipmentContainerFacadePort,
} from 'src/realtime/container';
import {
  ENTITY_ACTION_FACADE_TOKEN,
  ENTITY_RESOLVER_TOKEN,
  type EntityActionFacadePort,
  type EntityResolverPort,
} from 'src/realtime/entity-registry';
import { CLOCK_TOKEN, type ClockPort } from 'src/realtime/shared/infrastructure/time';
import { getOrCreate } from 'src/realtime/shared/lib/helpers/get-or-create-array.lib';
import { SPATIAL_GRID_INDEX_TOKEN, type SpatialGridIndexPort } from 'src/realtime/spatial-grid';

import { Inject, Injectable } from '@nestjs/common';

import { AoeTickPolicy } from '../../domain/polices/aoe-tick.policy';
import { CombatTargetingPolicy } from '../../domain/polices/combat-targeting.policy';
import type { AoeZoneRepositoryPort } from '../../domain/ports/aoe-zone-repository.port';
import { DamageCalculator } from '../../domain/services/damage-calculator.service';
import type { BatchUpdateAction, Target } from '../../domain/types/batch-update-action.type';
import { EquippedItemsToStatsMapper } from '../mappers/equipped-items-to-stats.mapper';
import { AOE_ZONE_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class ProcessAoeTickUseCase {
  constructor(
    @Inject(AOE_ZONE_REPOSITORY_TOKEN)
    private readonly aoeZoneRepository: AoeZoneRepositoryPort,
    @Inject(CLOCK_TOKEN) private readonly clockService: ClockPort,
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(ENTITY_ACTION_FACADE_TOKEN) private readonly entityActionFacade: EntityActionFacadePort,
    @Inject(SPATIAL_GRID_INDEX_TOKEN) private readonly spatialGridIndex: SpatialGridIndexPort,
    @Inject(EQUIPMENT_CONTAINER_FACADE_TOKEN)
    private readonly equipmentFacade: EquipmentContainerFacadePort,
  ) {}

  public execute() {
    const updatesByLocation = new Map<string, BatchUpdateAction[]>();
    const zones = this.aoeZoneRepository.getIterable();

    for (const zone of zones) {
      const now = this.clockService.nowMs();

      if (now >= zone.expiresAt) {
        this.aoeZoneRepository.remove(zone.id);
        continue;
      }

      if (!AoeTickPolicy.canTick(now, zone.lastUsedAt)) continue;

      const attacker = this.entityResolver.getByRef(zone.casterRef);

      if (!attacker) continue;

      const attackerEquipment = this.equipmentFacade.getEquippedItemsList(attacker.equipmentId);

      const { entities } = this.spatialGridIndex.queryRadius(
        zone.locationId,
        zone.x,
        zone.y,
        zone.radius,
        null,
      );

      const batchLocation = getOrCreate(updatesByLocation, zone.locationId, () => []);

      const targets: Target[] = [];

      entities.forEach(ref => {
        const victim = this.entityResolver.getByRef(ref);

        if (!victim) return;

        if (!CombatTargetingPolicy.canHit(attacker, victim)) return;

        const victimEquipment = this.equipmentFacade.getEquippedItemsList(victim.equipmentId);

        const damage = DamageCalculator.calculate({
          attacker: {
            baseStats: attacker.baseStats,
            equipmentItemsStats: EquippedItemsToStatsMapper.map(attackerEquipment),
            combatStats: attacker.combat,
          },
          source: { kind: 'physical', origin: 'effect' },
          victim: {
            baseStats: victim.baseStats,
            combatStats: victim.combat,
            equipmentItemsStats: EquippedItemsToStatsMapper.map(victimEquipment),
          },
        });

        const result = this.entityActionFacade.applyHit(victim, damage, attacker);

        if (!result) return;

        zone.lastUsedAt = now;
        targets.push({
          id: victim.id,
          type: victim.type,
          hp: result.hp,
          isAlive: result.isAlive,
          receivedDamage: damage,
        });

        console.log('TICK AOE', victim.name, damage);
      });

      batchLocation.push({
        targets,
        type: 'effect',
        skillId: zone.skillId,
      });
    }

    return updatesByLocation;
  }
}
