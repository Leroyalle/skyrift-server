import {
  PROCESS_AOE_TICK_TOKEN,
  PROCESS_COMBAT_TICK_TOKEN,
  PROCESS_PROJECTILES_TICK_TOKEN,
  type ProcessAoeTickPort,
  type ProcessCombatTickPort,
  type ProcessProjectileTickPort,
} from 'src/realtime/combat';
import { PROCESS_EFFECT_TICK_TOKEN, type ProcessEffectTickPort } from 'src/realtime/effect';
import { PROCESS_AI_TICK_USE_CASE_TOKEN, type ProcessAiTickPort } from 'src/realtime/flow';
import { PROCESS_INTERACTION_TICK_TOKEN } from 'src/realtime/interaction';
import { PROCESS_MOVEMENT_TICK_TOKEN, type ProcessMovementTickPort } from 'src/realtime/movement';
import { PROCESS_RECOVERY_TICK_TOKEN, type ProcessRecoveryTickPort } from 'src/realtime/recovery';
import { CLOCK_TOKEN, type ClockPort } from 'src/realtime/shared/infrastructure/time';

import { Inject, Injectable } from '@nestjs/common';

import {
  SIMULATION_INTERVALS_TOKEN,
  type SimulationIntervals,
} from '../config/simulation-intervals.config';

@Injectable()
export class SimulationTickUseCase {
  constructor(
    @Inject(CLOCK_TOKEN) private readonly clockService: ClockPort,
    @Inject(SIMULATION_INTERVALS_TOKEN) private readonly intervals: SimulationIntervals,
    @Inject(PROCESS_AOE_TICK_TOKEN) private readonly processAoeTick: ProcessAoeTickPort,
    @Inject(PROCESS_COMBAT_TICK_TOKEN) private readonly processCombatTick: ProcessCombatTickPort,
    @Inject(PROCESS_PROJECTILES_TICK_TOKEN)
    private readonly processProjectileTick: ProcessProjectileTickPort,
    @Inject(PROCESS_INTERACTION_TICK_TOKEN)
    private readonly processInteractionTick: ProcessCombatTickPort,
    @Inject(PROCESS_MOVEMENT_TICK_TOKEN)
    private readonly processMovementTick: ProcessMovementTickPort,
    @Inject(PROCESS_EFFECT_TICK_TOKEN) private readonly processEffectTick: ProcessEffectTickPort,
    @Inject(PROCESS_AI_TICK_USE_CASE_TOKEN)
    private readonly processAiTickUseCase: ProcessAiTickPort,
    @Inject(PROCESS_RECOVERY_TICK_TOKEN)
    private readonly processRecoveryTick: ProcessRecoveryTickPort,
  ) {}

  private readonly lastTickTimes = {
    movement: 0,
    combat: 0,
    aoe: 0,
    regeneration: 0,
    interaction: 0,
    aiMobs: 0,
    effects: 0,
    projectiles: 0,
  };

  public async execute(): Promise<void> {
    const now = this.clockService.nowMs();

    if (now - this.lastTickTimes.movement >= this.intervals.movement) {
      this.processMovementTick.execute();
      this.lastTickTimes.movement = now;
    }
    if (now - this.lastTickTimes.combat >= this.intervals.combat) {
      await this.processCombatTick.execute();
      this.lastTickTimes.combat = now;
    }
    if (now - this.lastTickTimes.projectiles >= this.intervals.projectiles) {
      this.processProjectileTick.execute();
      this.lastTickTimes.projectiles = now;
    }
    if (now - this.lastTickTimes.aoe >= this.intervals.aoe) {
      this.processAoeTick.execute();
      this.lastTickTimes.aoe = now;
    }
    if (now - this.lastTickTimes.regeneration >= this.intervals.regeneration) {
      this.processRecoveryTick.execute();
      this.lastTickTimes.regeneration = now;
    }
    if (now - this.lastTickTimes.interaction >= this.intervals.interaction) {
      await this.processInteractionTick.execute();
      this.lastTickTimes.interaction = now;
    }
    if (now - this.lastTickTimes.aiMobs >= this.intervals.aiMobs) {
      await this.processAiTickUseCase.execute();
      this.lastTickTimes.aiMobs = now;
    }
    if (now - this.lastTickTimes.effects >= this.intervals.effects) {
      this.processEffectTick.execute();
      this.lastTickTimes.effects = now;
    }
  }
}
