export interface RequestUseTeleportPort {
  execute(payload: RequestUseTeleportPayload): Promise<void>;
}

export interface RequestUseTeleportPayload {
  teleportId: string;
  pointerX: number;
  pointerY: number;
  characterId: string;
}
