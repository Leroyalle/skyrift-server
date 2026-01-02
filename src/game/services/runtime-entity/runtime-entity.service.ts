import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PlayerStateService } from '../characters/player-state/player-state.service';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';
import { EntityType } from 'src/game/types/entity/entity-type.type';
import { RuntimeMobService } from '../characters/runtime-mob/runtime-mob.service';
import { RuntimeNpcService } from '../characters/runtime-npc/runtime-npc.service';

@Injectable()
export class RuntimeEntityService {
  constructor(
    private readonly playerStateService: PlayerStateService,
    @Inject(forwardRef(() => RuntimeMobService))
    private readonly runtimeMobService: RuntimeMobService,
    private readonly runtimeNpcService: RuntimeNpcService,
  ) {}

  public getEntityByType(type: EntityType, id: string): TRuntimeEntity | undefined {
    if (type === 'player') {
      return this.playerStateService.getCharacterState(id);
    } else if (type === 'mob') {
      return this.runtimeMobService.getById(id);
    } else if (type === 'npc') {
      return this.runtimeNpcService.getById(id);
    }
    return;
  }
}
