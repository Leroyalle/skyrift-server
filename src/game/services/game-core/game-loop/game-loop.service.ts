import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { MovementService } from '../../movement/movement.service';
import { CombatService } from '../../combat/combat.service';
import { AoeService } from '../../combat/services/aoe/aoe.service';
import { RegenerationService } from '../../regeneration/regeneration.service';
import { InteractionService } from '../../interaction/interaction.service';
import { RuntimeEffectService } from '../../runtime-effect/runtime-effect.service';
import { ProjectileService } from '../../combat/services/projectile/projectile.service';
import { RuntimeMobService } from '../../characters/runtime-mob/runtime-mob.service';

@Injectable()
export class GameLoopService implements OnModuleInit, OnModuleDestroy {
  constructor(
    private readonly movementService: MovementService,
    private readonly combatService: CombatService,
    private readonly aoeService: AoeService,
    private readonly regenerationService: RegenerationService,
    private readonly interactionService: InteractionService,
    private readonly runtimeMobService: RuntimeMobService,
    private readonly runtimeEffectService: RuntimeEffectService,
    private readonly projectileService: ProjectileService,
  ) {}

  private gameTickInterval: NodeJS.Timeout;
  private lastTickTimes = {
    movement: 0,
    actions: 0,
    aoe: 0,
    regeneration: 0,
    interaction: 0,
    aiMobs: 0,
    effects: 0,
    projectiles: 0,
  };

  private readonly intervals = {
    movement: 150,
    actions: 200,
    aoe: 200,
    regeneration: 1000,
    interaction: 300,
    aiMobs: 200,
    effects: 200,
    projectiles: 100,
  };

  public onModuleInit() {
    this.gameTickInterval = setInterval(() => void this.tick(), 150);
  }

  public onModuleDestroy() {
    clearInterval(this.gameTickInterval);
  }

  private async tick(): Promise<void> {
    const now = Date.now();

    if (now - this.lastTickTimes.movement >= this.intervals.movement) {
      this.movementService.tickMovement();
      this.lastTickTimes.movement = now;
    }
    if (now - this.lastTickTimes.actions >= this.intervals.actions) {
      await this.combatService.tickActions();
      this.lastTickTimes.actions = now;
    }
    if (now - this.lastTickTimes.projectiles >= this.intervals.projectiles) {
      this.projectileService.tickProjectiles();
      this.lastTickTimes.projectiles = now;
    }
    if (now - this.lastTickTimes.aoe >= this.intervals.aoe) {
      this.aoeService.tickAoE();
      this.lastTickTimes.aoe = now;
    }
    if (now - this.lastTickTimes.regeneration >= this.intervals.regeneration) {
      this.regenerationService.tickRegeneration();
      this.lastTickTimes.regeneration = now;
    }
    if (now - this.lastTickTimes.interaction >= this.intervals.interaction) {
      await this.interactionService.tickInteractions();
      this.lastTickTimes.interaction = now;
    }
    if (now - this.lastTickTimes.aiMobs >= this.intervals.aiMobs) {
      await this.runtimeMobService.tickAiMobs();
      this.lastTickTimes.aiMobs = now;
    }
    if (now - this.lastTickTimes.effects >= this.intervals.effects) {
      this.runtimeEffectService.effectTick();
      this.lastTickTimes.effects = now;
    }
  }
}
