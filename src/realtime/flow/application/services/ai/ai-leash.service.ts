import {
  REQUEST_ATTACK_CANCEL_USE_CASE_TOKEN,
  type RequestAttackCancelUseCasePort,
} from 'src/realtime/combat';
import { ENTITY_RESOLVER_TOKEN, type EntityResolverPort } from 'src/realtime/entity-registry';
import type { ILocation } from 'src/realtime/location';
import {
  MOB_SESSION_FACADE_TOKEN,
  type MobSessionFacadePort,
  type MobSessionSnapshot,
} from 'src/realtime/mob-session';
import { MOVEMENT_QUEUE_FACADE_TOKEN, type MovementQueueFacadePort } from 'src/realtime/movement';
import { PATH_FINDING_SERVICE, type PathFindingServicePort } from 'src/realtime/path-finding';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AiLeashService {
  constructor(
    @Inject(MOB_SESSION_FACADE_TOKEN) private readonly mobSessionFacade: MobSessionFacadePort,

    @Inject(PATH_FINDING_SERVICE) private pathFindingService: PathFindingServicePort,
    @Inject(REQUEST_ATTACK_CANCEL_USE_CASE_TOKEN)
    private readonly requestAttackCancelUseCase: RequestAttackCancelUseCasePort,
    @Inject(MOVEMENT_QUEUE_FACADE_TOKEN)
    private readonly movementQueueFacade: MovementQueueFacadePort,
    @Inject(ENTITY_RESOLVER_TOKEN) private readonly entityResolver: EntityResolverPort,
  ) {}

  public async execute(
    mob: MobSessionSnapshot,
    location: ILocation,
    currentPos: IPositionTile,
    spawnPos: IPositionTile,
  ): Promise<boolean> {
    if (mob.state.current !== 'pursue' && mob.state.current !== 'attacking') return false;

    const steps = await this.pathFindingService.getPath(
      mob.position.locationId,
      currentPos,
      spawnPos,
      location.passableMap,
    );

    if (!steps) throw new Error('path or current target not found');

    if (!this.checkVictimIsActual(mob)) {
      this.startReturning(mob, steps);
      return true;
    }

    return this.handleSwitchMobToReturnOrPursue(mob, steps);
  }

  private handleSwitchMobToReturnOrPursue(
    mob: MobSessionSnapshot,
    steps: IPositionTile[],
  ): boolean {
    if (steps.length > 5) {
      this.startReturning(mob, steps);
      return true;
    }
    mob.state.current = 'pursue';
    return false;
  }

  private checkVictimIsActual(mob: MobSessionSnapshot): boolean {
    if (!mob.combat.currentTargetRef) return false;
    const victim = this.entityResolver.getByRef(mob.combat.currentTargetRef);

    if (!victim) return false;

    if (!victim.combat.isAlive) return false;

    return victim.position.locationId === mob.position.locationId;
  }

  private startReturning(mob: MobSessionSnapshot, steps: IPositionTile[]) {
    this.requestAttackCancelUseCase.execute({ entityRef: mob });
    this.mobSessionFacade.setState(mob.id, { current: 'return' });
    this.movementQueueFacade.set(mob, { steps });
  }
}
