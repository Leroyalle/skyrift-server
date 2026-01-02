import { IRuntimeCharacter } from 'src/characters/character/types/runtime-character';
import { IRuntimeMob } from 'src/game/services/characters/runtime-mob/types/runtime-mob.type';
import { IRuntimeNpc } from 'src/game/services/characters/runtime-npc/types/runtime-npc.type';

export type TRuntimeEntity = IRuntimeCharacter | IRuntimeMob | IRuntimeNpc;
