import { ILiveCharacter } from 'src/character/types/runtime-character';
import { IRuntimeMob } from 'src/game/services/runtime-mob/types/runtime-mob.type';

export type RuntimeEntity = ILiveCharacter | IRuntimeMob;
