import { FactionCompany } from 'src/faction/types/faction.enum';

export const isEnemyFaction = (f1: string, f2: string): boolean => {
  return FactionCompany[f1] !== FactionCompany[f2];
};
