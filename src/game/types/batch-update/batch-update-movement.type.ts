import { TDirection } from '../entity/direction.type';

export type BatchUpdateMovement =
  | BatchUpdateCharactersMovement
  | BatchUpdateMobsMovement;

type BatchUpdateBasic = {
  locationId: string;
  x: number;
  y: number;
  direction: TDirection;
};

type BatchUpdateCharactersMovement = BatchUpdateBasic & {
  type: 'player';
  characterId: string;
};
type BatchUpdateMobsMovement = BatchUpdateBasic & {
  type: 'mob';
  spawnMobId: string;
};
