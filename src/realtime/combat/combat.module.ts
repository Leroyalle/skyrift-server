import { SocketModule } from 'src/infrastructure/ws/socket.module';

import { Module } from '@nestjs/common';

import { ContainerModule } from '../container/container.module';
import { EntityRegistryModule } from '../entity-registry/entity-registry.module';
import { LocationModule } from '../location/location.module';
import { MovementModule } from '../movement/movement.module';
import { PathFindingModule } from '../path-finding/path-finding.module';
import { CLOCK_TOKEN, SystemClockService } from '../shared/infrastructure/time';
import { SpatialGridModule } from '../spatial-grid/spatial-grid.module';

import { AoeZoneReader } from './application/facades/aoe-zone.reader';
import { ApplyEffectImpactFacade } from './application/facades/apply-effect-impact.facade';
import {
  ACTION_QUEUE_REPOSITORY_TOKEN,
  ACTION_RESOLVER_TOKEN,
  AOE_ZONE_READER_TOKEN,
  AOE_ZONE_REPOSITORY_TOKEN,
  APPLY_EFFECT_IMPACT_FACADE_TOKEN,
  COMBAT_ACTION_PLANNER_TOKEN,
  PROCESS_AOE_TICK_TOKEN,
  PROCESS_COMBAT_TICK_TOKEN,
  PROCESS_PROJECTILES_TICK_TOKEN,
  PROJECTILE_REPOSITORY_TOKEN,
  REQUEST_ATTACK_CANCEL_USE_CASE_TOKEN,
  REQUEST_ATTACK_MOVE_USE_CASE_TOKEN,
  REQUEST_USE_SKILL_USE_CASE_TOKEN,
} from './application/ports/tokens';
import { CombatActionPlannerService } from './application/services/planning/combat-action-planner.service';
import { PendingActionSchedulerService } from './application/services/planning/pending-action-scheduler.service';
import { ActionResolverService } from './application/services/resolving/action-resolver.service';
import { AoESkillStarterService } from './application/services/resolving/aoe-skill-starter.service';
import { AttackStarterService } from './application/services/resolving/attack-starter.service';
import { AoeZoneLifecycleService } from './application/services/zones/aoe-zone-lifecycle.service';
import { ProcessAoeTickUseCase } from './application/use-cases/process-aoe-tick.use-case';
import { ProcessCombatTickUseCase } from './application/use-cases/process-combat-tick.use-case';
import { ProcessProjectileTick } from './application/use-cases/process-projectile-tick.use-case';
import { RequestAttackCancelUseCase } from './application/use-cases/request-attack-cancel.use-case';
import { RequestAttackMoveUseCase } from './application/use-cases/request-attack-move.use-case';
import { RequestUseSkillUseCase } from './application/use-cases/request-use-skill.use-case';
import { InMemoryActionQueueRepository } from './infrastructure/repositories/in-memory-action-queue.repository';
import { InMemoryAoeZonesRepository } from './infrastructure/repositories/in-memory-aoe-zones.repository';
import { ProjectileQueueRepository } from './infrastructure/repositories/in-memory-projectile-queue.repository';

@Module({
  imports: [
    EntityRegistryModule,
    SpatialGridModule,
    LocationModule,
    MovementModule,
    PathFindingModule,
    ContainerModule,
    SocketModule,
  ],
  providers: [
    {
      provide: ACTION_QUEUE_REPOSITORY_TOKEN,
      useClass: InMemoryActionQueueRepository,
    },
    {
      provide: AOE_ZONE_REPOSITORY_TOKEN,
      useClass: InMemoryAoeZonesRepository,
    },
    {
      provide: PROJECTILE_REPOSITORY_TOKEN,
      useClass: ProjectileQueueRepository,
    },
    {
      provide: PROCESS_AOE_TICK_TOKEN,
      useClass: ProcessAoeTickUseCase,
    },
    {
      provide: PROCESS_COMBAT_TICK_TOKEN,
      useClass: ProcessCombatTickUseCase,
    },
    {
      provide: PROCESS_PROJECTILES_TICK_TOKEN,
      useClass: ProcessProjectileTick,
    },
    {
      provide: REQUEST_ATTACK_CANCEL_USE_CASE_TOKEN,
      useClass: RequestAttackCancelUseCase,
    },
    {
      provide: REQUEST_ATTACK_MOVE_USE_CASE_TOKEN,
      useClass: RequestAttackMoveUseCase,
    },
    {
      provide: REQUEST_USE_SKILL_USE_CASE_TOKEN,
      useClass: RequestUseSkillUseCase,
    },
    {
      provide: AOE_ZONE_READER_TOKEN,
      useClass: AoeZoneReader,
    },
    {
      provide: APPLY_EFFECT_IMPACT_FACADE_TOKEN,
      useClass: ApplyEffectImpactFacade,
    },
    {
      provide: COMBAT_ACTION_PLANNER_TOKEN,
      useClass: CombatActionPlannerService,
    },
    {
      provide: ACTION_RESOLVER_TOKEN,
      useClass: ActionResolverService,
    },
    {
      provide: CLOCK_TOKEN,
      useClass: SystemClockService,
    },
    AoESkillStarterService,
    AttackStarterService,
    PendingActionSchedulerService,
    AoeZoneLifecycleService,
  ],
  exports: [
    PROCESS_AOE_TICK_TOKEN,
    PROCESS_COMBAT_TICK_TOKEN,
    PROCESS_PROJECTILES_TICK_TOKEN,
    REQUEST_ATTACK_CANCEL_USE_CASE_TOKEN,
    REQUEST_ATTACK_MOVE_USE_CASE_TOKEN,
    REQUEST_USE_SKILL_USE_CASE_TOKEN,
    AOE_ZONE_READER_TOKEN,
    APPLY_EFFECT_IMPACT_FACADE_TOKEN,
    COMBAT_ACTION_PLANNER_TOKEN,
    ACTION_RESOLVER_TOKEN,
  ],
})
export class CombatModule {}
