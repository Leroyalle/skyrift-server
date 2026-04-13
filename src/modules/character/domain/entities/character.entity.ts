import type { Appearance } from 'src/common/domain/vo/appearance.vo';

import type { CharacterSnapshot, ICharacter } from '../types/character.type';

interface Props {
  id: string;
  userId: string;
  classId: string;
  name: string;
  appearance: Appearance;
}
export class Character {
  private constructor(private readonly props: ICharacter) {}

  public static create(props: Props) {
    return new Character({
      id: props.id,
      userId: props.userId,
      classId: props.classId,
      name: props.name,
      appearance: props.appearance,
      level: 1,
      x: 2016,
      y: 960,
      maxHp: 1000,
      hp: 1000,
      baseMagicDamage: 20,
      basePhysicalDamage: 50,
      critMultiplier: 1,
      experienceToNextLevel: 400,
      attackRange: 4,
      attackSpeed: 1000,
      isAlive: true,
      walkSpeed: 450,
      skillsIds: [],
      questsIds: [],
      physicalDefense: 10,
      magicDefense: 5,
      isDeleted: false,
      skillPoints: 0,
      locationId: '1',
      equipmentId: '1',
      bagId: '1',
      createdAt: new Date(),
      experience: 0,
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
