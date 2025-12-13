export interface UnauthenticatedUserData {
  userId?: string;
  characterId?: string;
  locationId?: string;
  position?: { x: number; y: number };
}

export interface AuthenticatedUserData {
  userId: string;
  characterId: string;
  locationId: string;
  position: { x: number; y: number };
}
