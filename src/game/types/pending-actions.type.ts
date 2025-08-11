export type PendingAction = {
  attackerId: string;
  victimId: string;
  actionType: ActionType;
  state: State;
};

export type ActionType = 'damage' | 'heal';
export type State = 'wait-path' | 'move-to-target' | 'attack';
