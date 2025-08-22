import { registerEnumType } from '@nestjs/graphql';

export enum SkillType {
  Target = 'Target',
  AoE = 'AoE',
  Self = 'Self',
  Passive = 'Passive',
  Buff = 'Buff',
  Debuff = 'Debuff',
}

registerEnumType(SkillType, {
  name: 'SkillType',
  description: 'Тип скилла. Например: aoe, target, buff',
});
