export type LiveCharacterState = {
  id: string;
  name: string;
  x: number;
  y: number;
  level: number;
  hp: number;
  maxHp: number;
  defense: number;
  attackRange: number;
  isAlive: boolean;
  basePhysicalDamage: number;
  baseMagicDamage: number;
  locationId: string;
  // TODO: add the damage(now) - sum all damage items
};
