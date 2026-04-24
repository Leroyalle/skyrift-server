export interface RequestAttackCancelPort {
  execute(payload: RequestAttackCancelPayload): void;
}

export interface RequestAttackCancelPayload {
  characterId: string;
}
