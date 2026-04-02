import type { IPlayerSession, PlayerSessionSnapshot } from '../types/player-session.type';

export class PlayerSession {
  private constructor(private props: IPlayerSession) {}

  public static create(props: IPlayerSession): PlayerSession {
    return new PlayerSession(props);
  }

  public getId(): string {
    return this.props.id;
  }

  public moveTo(x: number, y: number, movedAt: number): void {
    this.ensureAlive();
    this.props.position.x = x;
    this.props.position.y = y;
    this.props.combat.lastMoveAt = movedAt;
    this.markDirty();
  }

  public receiveDamage(amount: number): void {
    if (!this.props.combat.isAlive) return;

    this.props.combat.hp = Math.min(
      Math.max(0, this.props.combat.hp - amount),
      this.props.baseStats.maxHp,
    );

    if (this.props.combat.hp === 0) {
      this.props.combat.isAlive = false;
      this.props.combat.currentTargetId = null;
    }

    this.markDirty();
  }

  public getDerivedStats() {
    const maxHp = this.props.baseStats.maxHp;
    const physicalDamage = this.props.baseStats.basePhysicalDamage;
    const magicDamage = this.props.baseStats.baseMagicDamage;
    const physicalDefense = this.props.baseStats.physicalDefense;
    const magicDefense = this.props.baseStats.magicDefense;

    // for (const itemId of Object.values(this.props.equipment)) {
    //   if (!itemId) continue;

    //   const item = this.requireItem(itemId);
    //   const modifiers = item.statModifiers;
    //   if (!modifiers) continue;

    //   maxHp += modifiers.maxHp ?? 0;
    //   physicalDamage += modifiers.physicalDamage ?? 0;
    //   magicDamage += modifiers.magicDamage ?? 0;
    //   physicalDefense += modifiers.physicalDefense ?? 0;
    //   magicDefense += modifiers.magicDefense ?? 0;
    // }

    return {
      maxHp,
      physicalDamage,
      magicDamage,
      physicalDefense,
      magicDefense,
      attackSpeed: this.props.baseStats.attackSpeed,
      attackRange: this.props.baseStats.attackRange,
      walkSpeed: this.props.baseStats.walkSpeed,
    };
  }

  public canUseSkill(skillId: string): boolean {
    const skill = this.props.skillsById.get(skillId);
    if (!skill) throw new Error('Skill not found');

    if (skill.lastUsedAt === null) return true;

    return Date.now() - skill.lastUsedAt >= skill.cooldownMs;
  }

  public toPublicSnapshot(): PlayerSessionSnapshot {
    return {
      id: this.props.id,
      name: this.props.name,
      level: this.props.level,
      userId: this.props.userId,
      skillsById: this.props.skillsById,
      combat: { ...this.props.combat },
      baseStats: { ...this.props.baseStats },
      appearance: { ...this.props.appearance.snapshot() },
      position: this.props.position,
      equipmentId: this.props.equipmentId,
      bagId: this.props.bagId,
      type: 'player',
    };
  }

  public isDirty(): boolean {
    return this.props.dirty;
  }

  public markPersisted(): void {
    this.props.dirty = false;
  }

  private ensureAlive(): void {
    if (!this.props.combat.isAlive) {
      throw new Error('Player is dead');
    }
  }

  private markDirty(): void {
    this.props.dirty = true;
  }
}
