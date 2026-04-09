import {
  EQUIPMENT_CONTAINER_FACADE_TOKEN,
  type EquipmentContainerFacadePort,
} from 'src/realtime/container';
import {
  ENTITY_ACTION_FACADE_TOKEN,
  type EntityActionFacadePort,
} from 'src/realtime/entity-registry';

import { Inject, Injectable } from '@nestjs/common';

import { DamageCalculator } from '../../domain/services/damage-calculator.service';
import { EquippedItemsToStatsMapper } from '../mappers/equipped-items-to-stats.mapper';
import type {
  ApplyEffectImpactFacadePort,
  ApplyEffectImpactPayload,
} from '../ports/apply-effect-impact-facade.port';

@Injectable()
export class ApplyEffectImpactFacade implements ApplyEffectImpactFacadePort {
  constructor(
    @Inject(EQUIPMENT_CONTAINER_FACADE_TOKEN)
    private readonly equipmentFacade: EquipmentContainerFacadePort,
    @Inject(ENTITY_ACTION_FACADE_TOKEN) private readonly entityActionFacade: EntityActionFacadePort,
  ) {}

  public execute(payload: ApplyEffectImpactPayload) {
    const targetEquipment = this.equipmentFacade.getEquippedItemsList(payload.target.equipmentId);

    const damage = DamageCalculator.calculate({
      power: {
        mode: 'fixed',
        amount: payload.magnitude,
      },
      victim: {
        baseStats: payload.target.baseStats,
        combatStats: payload.target.combat,
        equipmentItemsStats: EquippedItemsToStatsMapper.map(targetEquipment),
      },
      source: { kind: 'physical', origin: 'effect' },
      skill: payload.skillId ? { magnitude: payload.magnitude } : undefined,
    });

    const hitResult = this.entityActionFacade.applyHit(payload.target, damage, payload.attackerRef);

    if (!hitResult) return;

    return { ...hitResult, damage };
  }
}
