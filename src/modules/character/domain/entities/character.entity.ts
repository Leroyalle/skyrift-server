interface Props {
  experience: number;
  experienceToNextLevel: number;
  skillPoints: number;
  isDeleted: boolean;
  userId: string;
  classId: string;
  skillsIds: string[];
  // characterClass: CharacterClass;
  locationId: string;
  // characterSkills: CharacterSkill[];
  // bag: Bag;
  // quests: PlayerQuest[];
  id: string;
  name: string;
  level: number;
  maxHp: number;
  hp: number;
  basePhysicalDamage: number;
  baseMagicDamage: number;
  physicalDefense: number;
  magicDefense: number;
  critMultiplier: number;
  attackSpeed: number;
  attackRange: number;
  isAlive: boolean;
  x: number;
  y: number;
  walkSpeed: number;
  equipmentId: string;
  appearanceId: string;
  // equipment: Equipment;
  // appearance: Appearance;
  createdAt: Date;
  // updatedAt: Date;
}

export class Character {
  constructor(private readonly props: Props) {}

  public static create(props: Props) {
    return new Character(props);
  }

  public snapshot(): Readonly<Props> {
    return {
      ...this.props,
      createdAt: new Date(this.props.createdAt),
    };
  }
}
