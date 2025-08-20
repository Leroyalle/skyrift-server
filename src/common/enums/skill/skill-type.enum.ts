import { registerEnumType } from '@nestjs/graphql';

export enum SkillType {
  Target = 'target',
  AoE = 'aoe',
  Self = 'self',
  Passive = 'passive',
  Buff = 'buff',
  Debuff = 'debuff',
}

registerEnumType(SkillType, {
  name: 'SkillType',
  description: 'Тип скилла. Например: aoe, target, buff',
});
