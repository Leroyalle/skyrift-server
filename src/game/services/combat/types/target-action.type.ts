import { EntityType } from 'src/game/types/entity/entity-type.type';

export type TargetAction =
  | { kind: 'target'; id: string; type: EntityType }
  | { kind: 'aoe'; x: number; y: number };
