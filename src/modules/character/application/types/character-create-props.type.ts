export interface CharacterCreateProps {
  experience: number;
  experienceToNextLevel: number;
  skillPoints: number;
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
  questsIds: string[];
  x: number;
  y: number;
  walkSpeed: number;
  equipmentId: string | null;
  appearance: {
    head: string;
    body: string;
  };
  bagId: string | null;
}
