import { registerEnumType } from '@nestjs/graphql';

export enum FactionEnum {
  DawnDominion = 'Доминион Рассвета',
  Silverleaf = 'Серебролистые',
  CrimsonCoven = 'Алый Ковен',
  Flameborn = 'Пламенорождённые',
}

registerEnumType(FactionEnum, {
  name: 'FactionEnum',
  description: 'Доступные фракции.',
});

export const FactionCompany = {
  [FactionEnum.DawnDominion]: 1,
  [FactionEnum.Silverleaf]: 1,
  [FactionEnum.CrimsonCoven]: 2,
  [FactionEnum.Flameborn]: 2,
} as const;
