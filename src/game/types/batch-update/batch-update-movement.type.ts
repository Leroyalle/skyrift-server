export type TBatchUpdateMovement = {
  locationId: string;
  characterId: string;
  x: number;
  y: number;
  direction: TDirection;
};

type TDirection = 'left' | 'right' | 'up' | 'down';
