export interface RequestUseItemPort {
  execute(payload: RequestUseItemPayload): void;
}

export interface RequestUseItemPayload {
  characterId: string;
  itemId: string;
}
