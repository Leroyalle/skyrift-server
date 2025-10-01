import { Effect } from 'src/effect/entities/effect.entity';
import { IRuntimeExpirable } from 'src/game/types/runtime-expirable.type';

export interface IRuntimeEffect extends Effect, IRuntimeExpirable {}
