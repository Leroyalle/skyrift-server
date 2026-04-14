export interface IMob {
  triggerRange: number;
  chaseSpeed: number;
  expReward: number;
  respawnTime: number;
  spawnId: string;
  id: string;
  name: string;
  level: number;
  maxHp: number;
  locationId: string;
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
}
