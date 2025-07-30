export type LiveCharacterState = {
  id: string;
  name: string;
  position: {
    x: number;
    y: number;
  };
  hp: number;
  maxHp: number;
  defense: number;
  isAlive: boolean;
  attackRange: number;
  level: number;
};
