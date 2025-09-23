import { LiveCharacter } from 'src/character/types/live-character-state.type';
import { RuntimeMob } from 'src/game/services/runtime-mob/types/runtime-mob.type';

export type WorldEntity = LiveCharacter | RuntimeMob;
