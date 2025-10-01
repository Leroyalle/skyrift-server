import { registerEnumType } from '@nestjs/graphql';

export enum EffectType {
  InstantDamage = 'instant_damage', // наносит мгновенный урон
  DamageOverTime = 'damage_over_time', // урон по таймеру (DOT)
  Heal = 'heal', // мгновенное восстановление здоровья
  Shield = 'shield', // временный щит, поглощает урон
  SpeedBoost = 'speed_boost', // временное увеличение скорости
  Slow = 'slow', // временное снижение скорости
  Stun = 'stun', // оглушение, нельзя двигаться или атаковать
}

registerEnumType(EffectType, {
  name: 'EffectType',
  description: 'Тип эффекта',
});
