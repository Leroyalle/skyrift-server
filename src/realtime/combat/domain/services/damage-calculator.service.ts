import type { CalculatePayload } from '../types/calculate-payload.type';

export class DamageCalculator {
  public static calculate(payload: CalculatePayload) {
    const victimDefense = this.resolveDefense({ source: payload.source, victim: payload.victim });
    const attackerPower = this.resolvePower(payload);

    const defense = payload.source.kind === 'true' ? 0 : victimDefense;
    const receivedDamage = Math.max(attackerPower - defense, 0);

    return receivedDamage;
  }

  private static resolvePower(payload: Omit<CalculatePayload, 'victim'>) {
    const { baseStats, equipmentItemsStats } = payload.attacker;

    const damage =
      payload.source.kind === 'physical'
        ? baseStats.basePhysicalDamage +
          equipmentItemsStats.reduce((acc, item) => {
            return (acc += item.physicalDamage ?? 0);
          }, 0)
        : baseStats.baseMagicDamage +
          equipmentItemsStats.reduce((acc, item) => {
            return (acc += item.magicDamage ?? 0);
          }, 0);

    return damage;
  }

  private static resolveDefense(payload: Omit<CalculatePayload, 'attacker' | 'skill'>) {
    const { baseStats, equipmentItemsStats } = payload.victim;
    const victimDefense =
      payload.source.kind === 'physical'
        ? baseStats.physicalDefense +
          equipmentItemsStats.reduce((acc, item) => {
            return (acc += item.physicalDefense ?? 0);
          }, 0)
        : baseStats.magicDefense +
          equipmentItemsStats.reduce((acc, item) => {
            return (acc += item.magicDefense ?? 0);
          }, 0);

    return victimDefense;
  }
}
