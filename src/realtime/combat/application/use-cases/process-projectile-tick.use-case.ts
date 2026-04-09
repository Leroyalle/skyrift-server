import {
  EQUIPMENT_CONTAINER_FACADE_TOKEN,
  type EquipmentContainerFacadePort,
} from 'src/realtime/container';
import {
  ENTITY_ACTION_FACADE_TOKEN,
  ENTITY_RESOLVER_TOKEN,
  type EntityActionFacadePort,
  type EntityResolverPort,
  type EntitySnapshot,
} from 'src/realtime/entity-registry';
import { CLOCK_TOKEN, type ClockPort } from 'src/realtime/shared/infrastructure/time';
import { getOrCreate } from 'src/realtime/shared/lib/helpers/get-or-create-array.lib';
import { getTileByPosition } from 'src/realtime/shared/lib/helpers/get-tile-by-position.lib';

import { Inject, Injectable } from '@nestjs/common';

import { isAttackInProgress } from '../../domain/lib/is-attack-in-progress.lib';
import type { ProjectileQueueRepositoryPort } from '../../domain/ports/projectile-queue-repository.port';
import { DamageCalculator } from '../../domain/services/damage-calculator.service';
import type { BatchUpdateAction } from '../../domain/types/batch-update-action.type';
import type { IProjectile } from '../../domain/types/projectile-queue.type';
import { EquippedItemsToStatsMapper } from '../mappers/equipped-items-to-stats.mapper';
import { PROJECTILE_REPOSITORY_TOKEN } from '../ports/tokens';

@Injectable()
export class ProcessProjectileTick {
  constructor(
    @Inject(PROJECTILE_REPOSITORY_TOKEN)
    private readonly projectileRepository: ProjectileQueueRepositoryPort,
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
    @Inject(ENTITY_ACTION_FACADE_TOKEN) private readonly entityActionFacade: EntityActionFacadePort,
    @Inject(CLOCK_TOKEN) private readonly clockService: ClockPort,
    @Inject(EQUIPMENT_CONTAINER_FACADE_TOKEN)
    private readonly equipmentFacade: EquipmentContainerFacadePort,
  ) {}

  public execute() {
    const updatesByLocation = new Map<string, BatchUpdateAction[]>();

    for (const { attackerRef, projectile } of this.projectileRepository.getAll()) {
      const now = this.clockService.nowMs();
      const attacker = this.entityResolver.getByRef(attackerRef);
      if (!attacker) return;
      const victim = this.entityResolver.getByRef(projectile.victimRef);
      if (!victim) return;
      if (attacker.position.locationId !== victim.position.locationId) return;
      const attackInProgress = isAttackInProgress(
        getTileByPosition(victim.position.x, victim.position.y),
        100,
        {
          startedAt: projectile.startedAt,
          startedTile: projectile.startedTile,
        },
      );
      if (attackInProgress) return;

      const result = this.applyProjectileAction(attacker, victim, projectile, { now });

      this.projectileRepository.remove(attackerRef, projectile.startedAt);

      if (!result) return;

      const batchLocation = getOrCreate(updatesByLocation, attacker.position.locationId, () => []);

      batchLocation.push(result);
    }

    return updatesByLocation;
  }

  private applyProjectileAction(
    attacker: EntitySnapshot,
    victim: EntitySnapshot,
    projectile: IProjectile,
    context: {
      now: number;
    },
  ): BatchUpdateAction | undefined {
    const now = context.now;

    const skill = projectile.skillId
      ? this.entityActionFacade.getSkillCombatData(attacker, projectile.skillId)
      : null;

    const equipmentAttacker = this.equipmentFacade.getEquippedItemsList(attacker.equipmentId);
    const equipmentVictim = this.equipmentFacade.getEquippedItemsList(victim.equipmentId);

    switch (skill?.type) {
      case 'Target': {
        // const receivedDamage = skill.skill.damage;
        const damage = DamageCalculator.calculate({
          attacker: {
            baseStats: attacker.baseStats,
            combatStats: attacker.combat,
            equipmentItemsStats: EquippedItemsToStatsMapper.map(equipmentAttacker),
          },
          victim: {
            baseStats: victim.baseStats,
            combatStats: victim.combat,
            equipmentItemsStats: EquippedItemsToStatsMapper.map(equipmentVictim),
          },
          skill: skill ? { magnitude: skill.magnitude ?? 0 } : undefined,
          source: { kind: 'physical', origin: 'skill' },
        });

        const hitResult = this.entityActionFacade.applyHit(victim, damage, attacker);
        this.entityActionFacade.setLastAttackAt(attacker, now);
        this.entityActionFacade.setMovementLockedUntil(victim, now);

        if (!hitResult) return;

        return {
          type: 'skill',
          skillId: skill.id,
          targets: [
            {
              id: victim.id,
              type: victim.type,
              receivedDamage: damage,
              isAlive: hitResult.isAlive,
              hp: hitResult.hp,
            },
          ],
        };
      }
      default: {
        const damage = DamageCalculator.calculate({
          attacker: {
            baseStats: attacker.baseStats,
            combatStats: attacker.combat,
            equipmentItemsStats: EquippedItemsToStatsMapper.map(equipmentAttacker),
          },
          victim: {
            baseStats: victim.baseStats,
            combatStats: victim.combat,
            equipmentItemsStats: EquippedItemsToStatsMapper.map(equipmentVictim),
          },
          source: { kind: 'physical', origin: 'autoAttack' },
        });

        const hitResult = this.entityActionFacade.applyHit(victim, damage, attacker);
        this.entityActionFacade.setLastAttackAt(attacker, now);
        this.entityActionFacade.setMovementLockedUntil(victim, now);

        if (!hitResult) return;

        return {
          type: 'autoAttack',
          skillId: null,
          targets: [
            {
              id: victim.id,
              type: victim.type,
              receivedDamage: damage,
              isAlive: hitResult.isAlive,
              hp: hitResult.hp,
            },
          ],
        };
      }
    }
  }
}
