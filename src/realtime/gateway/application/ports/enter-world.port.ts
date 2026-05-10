export interface EnterWorldPort {
  execute(payload: GetInitialStatePayload): Promise<void>;
}

export interface GetInitialStatePayload {
  characterId: string;
  userId: string;
  locationId: string;
}
