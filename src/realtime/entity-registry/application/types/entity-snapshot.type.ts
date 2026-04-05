import type { MobSessionSnapshot } from 'src/realtime/mob-session';
import type { PlayerSessionSnapshot } from 'src/realtime/player-session';

export type EntitySnapshot = PlayerSessionSnapshot | MobSessionSnapshot;
