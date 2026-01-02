import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PlayerStateService } from '../characters/player-state/player-state.service';
import { TRuntimeEntity } from 'src/game/types/entity/runtime-entity.type';
import { EntityType } from 'src/game/types/entity/entity-type.type';
import { RuntimeMobService } from '../characters/runtime-mob/runtime-mob.service';

@Injectable()
export class RuntimeEntityService {
  constructor(
    private readonly playerStateService: PlayerStateService,
    @Inject(forwardRef(() => RuntimeMobService))
    private readonly runtimeMobService: RuntimeMobService,
  ) {}

  public getEntityByType(type: EntityType, id: string): TRuntimeEntity | undefined {
    if (type === 'player') {
      return this.playerStateService.getCharacterState(id);
    } else if (type === 'mob') {
      return this.runtimeMobService.getById(id);
    }
    return;
  }
}
