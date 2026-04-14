export interface INpc {
  spawnId: string;
  id: string;
  name: string;
  level: number;
  maxHp: number;
  chaseSpeed: number;
  hp: number;
  basePhysicalDamage: number;
  baseMagicDamage: number;
  physicalDefense: number;
  magicDefense: number;
  locationId: string;
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
