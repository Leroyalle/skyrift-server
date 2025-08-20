import { SkillEffectConfig } from 'src/character-class/skill/dto/skill-effect-config.input';

export type ActiveAoEZone = {
  id: string;
  skillId: string;
  casterId: string;
  locationId: string;
  x: number;
  y: number;
  radius: number;
  effects: SkillEffectConfig[];
  expiresAt: number;
  lastUsedAt: number | null;
};
