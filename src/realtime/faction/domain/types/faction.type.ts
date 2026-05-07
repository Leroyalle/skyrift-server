export type FactionName =
  | 'DawnDominion'
  | 'Silverleaf'
  | 'CrimsonCoven'
  | 'Flameborn'
  | 'Wild'
  | 'Neutral';

export interface Faction {
  id: string;
  name: FactionName;
  logo: string;
  description: string;
}
