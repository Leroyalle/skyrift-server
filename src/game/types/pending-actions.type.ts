export type PendingAction = {
  attackerId: string;
  victimId: string;
  type: ActionType;
};

export type ActionType = 'attack' | 'heal';
