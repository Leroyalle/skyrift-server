import type { ISkillSession } from 'src/realtime/skill-session';

export interface ConnectPlayerPayload {
  experience: number;
  experienceToNextLevel: number;
  skillPoints: number;
  isDeleted: boolean;
  userId: string;
  classId: string;
  skills: ISkillSession[];
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
  equipmentId: string;
  appearance: Appearance;
  createdAt: Date;
  bagId: string;
}

interface Appearance {
  body: string;
  head: string;
}
