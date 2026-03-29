export type EquipmentSlot =
  | 'helmet'
  | 'breastplate'
  | 'gloves'
  | 'legs'
  | 'cloak'
  | 'mainHand'
  | 'offHand'
  | 'ring1'
  | 'ring2';

export type RuntimeSkill = {
  skillId: string;
  level: number;
  cooldownMs: number;
  lastUsedAt: number | null;
  id: string;
};

export type RuntimeItem = {
  id: string;
  templateId: string;
  itemType: 'weapon' | 'armor' | 'resource' | 'consumable';
  slot?: EquipmentSlot;
  name: string;
  statModifiers?: {
    physicalDamage?: number;
    magicDamage?: number;
    physicalDefense?: number;
    magicDefense?: number;
    maxHp?: number;
  };
};

export type PlayerSessionProps = {
  // playerId: string;
  userId: string;
  characterId: string;
  name: string;
  level: number;

  baseStats: {
    maxHp: number;
    basePhysicalDamage: number;
    baseMagicDamage: number;
    physicalDefense: number;
    magicDefense: number;
    attackSpeed: number;
    attackRange: number;
    walkSpeed: number;
  };

  position: {
    locationId: string;
    x: number;
    y: number;
  };

  combat: {
    hp: number;
    isAlive: boolean;
    currentTargetId: string | null;
    lastAttackAt: number;
    lastMoveAt: number;
  };

  // itemsById: Map<string, RuntimeItem>;
  skillsById: Map<string, RuntimeSkill>;
  // inventoryItemIds: Set<string>;
  bagId: string;
  equipmentId: string;

  // equipment: Record<EquipmentSlot, string | null>;

  dirty: boolean;
};

export class PlayerSession {
  private constructor(private props: PlayerSessionProps) {}

  public static create(props: PlayerSessionProps): PlayerSession {
    return new PlayerSession(props);
  }

  public getId(): string {
    return this.props.characterId;
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

  public toPublicSnapshot() {
    return {
      characterId: this.props.characterId,
      name: this.props.name,
      level: this.props.level,
      locationId: this.props.position.locationId,
      x: this.props.position.x,
      y: this.props.position.y,
      hp: this.props.combat.hp,
      isAlive: this.props.combat.isAlive,
      equipmentId: this.props.equipmentId,
      bagId: this.props.bagId,
      derivedStats: this.getDerivedStats(),
    };
  }

  public toPersistencePayload() {
    return {
      characterId: this.props.characterId,
      locationId: this.props.position.locationId,
      x: this.props.position.x,
      y: this.props.position.y,
      hp: this.props.combat.hp,
      isAlive: this.props.combat.isAlive,
      equipmentId: this.props.equipmentId,
      bagId: this.props.bagId,
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
