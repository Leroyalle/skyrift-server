import type { CharacterSnapshot, ICharacter } from '../types/character.type';

export class Character {
  private constructor(private readonly props: ICharacter) {}

  public static create(props: ICharacter) {
    return new Character({
      id: props.id,
      userId: props.userId,
      classId: props.classId,
      name: props.name,
      appearance: props.appearance,
      level: props.level,
      x: props.x,
      y: props.y,
      maxHp: props.maxHp,
      hp: props.hp,
      baseMagicDamage: props.baseMagicDamage,
      basePhysicalDamage: props.basePhysicalDamage,
      critMultiplier: props.critMultiplier,
      experienceToNextLevel: props.experienceToNextLevel,
      attackRange: props.attackRange,
      attackSpeed: props.attackSpeed,
      isAlive: props.isAlive,
      walkSpeed: props.walkSpeed,
      skillsIds: props.skillsIds,
      questsIds: props.questsIds,
      physicalDefense: props.physicalDefense,
      magicDefense: props.magicDefense,
      isDeleted: props.isDeleted,
      skillPoints: props.skillPoints,
      locationId: props.locationId,
      equipmentId: props.equipmentId,
      bagId: props.bagId,
      createdAt: props.createdAt,
      experience: props.experience,
    });
  }

  public snapshot(): Readonly<CharacterSnapshot> {
    return {
      ...this.props,
      appearance: this.props.appearance.snapshot(),
      createdAt: new Date(this.props.createdAt),
    };
  }
}
