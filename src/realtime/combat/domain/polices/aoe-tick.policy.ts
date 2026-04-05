export class AoeTickPolicy {
  public static canTick(now: number, lastUsedAt?: number | null): boolean {
    if (!lastUsedAt) return true;
    return now - lastUsedAt > 1000;
  }
}
