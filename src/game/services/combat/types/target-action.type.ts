export type TargetAction =
  | { kind: 'player'; id: string }
  | { kind: 'aoe'; x: number; y: number };
