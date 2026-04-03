export interface IEffect {
  id: string;
  type: EffectType;
  damagePerSecond?: number;
  durationMs: number;
  amount?: number;
  slowPercent?: number;
  skillId: string;
}

export type EffectType =
  | 'instant_damage' // наносит мгновенный урон
  | 'damage_over_time' // урон по таймеру (DOT)
  | 'heal' // мгновенное восстановление здоровья
  | 'shield' // временный щит| поглощает урон
  | 'speed_boost' // временное увеличение скорости
  | 'slow' // временное снижение скорости
  | 'stun'; // оглушение, нельзя двигаться или атаковать
