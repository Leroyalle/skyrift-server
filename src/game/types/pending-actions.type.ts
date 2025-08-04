export type PendingAction = {
  attackerId: string;
  victimId: string;
  type: ActionType;
  ts: Date;
};

export type ActionType = 'attack' | 'heal';
