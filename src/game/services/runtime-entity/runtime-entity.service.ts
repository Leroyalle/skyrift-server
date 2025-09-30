import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { PlayerStateService } from '../player-state/player-state.service';
import { RuntimeMobService } from '../runtime-mob/runtime-mob.service';
import { RuntimeEntity } from 'src/game/types/entity/runtime-entity.type';
import { EntityType } from 'src/game/types/entity/entity-type.type';

@Injectable()
export class RuntimeEntityService {
  constructor(
    private readonly playerStateService: PlayerStateService,
    @Inject(forwardRef(() => RuntimeMobService))
    private readonly runtimeMobService: RuntimeMobService,
  ) {}

  public getEntityByType(
    type: EntityType,
    id: string,
  ): RuntimeEntity | undefined {
    if (type === 'player') {
      return this.playerStateService.getCharacterState(id);
    } else if (type === 'mob') {
      return this.runtimeMobService.getById(id);
    }
    return;
  }
}
