import type { Appearance } from 'src/common/domain/vo/appearance.vo';

export interface ICharacter {
  experience: number;
  experienceToNextLevel: number;
  skillPoints: number;
  isDeleted: boolean;
  userId: string;
  classId: string;
  skillsIds: string[];
  locationId: string;
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
  questsIds: string[];
  x: number;
  y: number;
  walkSpeed: number;
  equipmentId: string | null;
  appearance: Appearance;
  createdAt: Date;
  bagId: string | null;
}

export type CharacterSnapshot = Omit<ICharacter, 'appearance'> & {
  appearance: {
    body: string;
    head: string;
  };
};
