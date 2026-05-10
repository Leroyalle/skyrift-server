export type FactionName = 'DawnDominion' | 'Silverleaf' | 'CrimsonCoven' | 'Flameborn';

export interface Faction {
  id: string;
  name: FactionName;
  logo: string;
  description: string;
}
