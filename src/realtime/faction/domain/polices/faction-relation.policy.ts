import { FactionCompany } from '../constants/faction-company.constants';

export class FactionRelationPolicy {
  public static areAllies(f1: string, f2: string): boolean {
    return FactionCompany[f1] === FactionCompany[f2];
  }
}
