export type TBatchUpdate = {
  characterId: string;
  info: {
    position: { x: number; y: number };
    locationId: string;
  };
};
