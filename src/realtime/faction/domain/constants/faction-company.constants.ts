import type { FactionName } from '../types/faction.type';

export const FactionCompany: Record<FactionName, number> = {
  DawnDominion: 1,
  Silverleaf: 1,
  CrimsonCoven: 2,
  Flameborn: 2,
  Neutral: 0,
  Wild: 0,
} as const;
