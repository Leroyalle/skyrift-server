import { SkillEffectConfig } from 'src/character-class/skill/dto/skill-effect-config.input';
import { IRuntimeExpirable } from 'src/game/types/runtime-expirable.type';

export interface ActiveAoEZone extends IRuntimeExpirable {
  id: string;
  skillId: string;
  casterId: string;
  locationId: string;
  x: number;
  y: number;
  radius: number;
  effects: SkillEffectConfig[];
}
