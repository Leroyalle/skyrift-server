export type PendingAction = {
  attackerId: string;
  victimId: string;
  actionType: ActionType;
  state: State;
  skillId: string | null;
};

export enum ActionType {
  AutoAttack = 'autoAttack',
  Heal = 'heal',
  Skill = 'skill',
}

export type State = 'wait-path' | 'move-to-target' | 'attack';
