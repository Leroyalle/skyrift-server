export interface RequestTalkToNpcPort {
  execute(payload: RequestTalkToNpcPayload): Promise<void>;
}

export interface RequestTalkToNpcPayload {
  npcId: string;
  locationId: string;
  characterId: string;
}
