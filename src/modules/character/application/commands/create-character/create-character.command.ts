import type { Appearance } from 'src/common/domain/vo/appearance.vo';

interface Props {
  experience: number;
  experienceToNextLevel: number;
  skillPoints: number;
  isDeleted: boolean;
  userId: string;
  classId: string;
  skillsIds: string[];
  locationId: string;
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
  questsIds: string[];
  x: number;
  y: number;
  walkSpeed: number;
  equipmentId: string;
  appearance: Appearance;
  bagId: string;
}

export class CreateCharacterCommand {
  constructor(public readonly props: Props) {}
}
