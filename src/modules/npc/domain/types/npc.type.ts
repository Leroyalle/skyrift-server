export interface INpc {
  spawnId: string;
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
  x: number;
  y: number;
  walkSpeed: number;
  equipmentId: string;
  appearance: {
    body: string;
    head: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
