export interface ConnectionPresenceAdapterPort {
  onConnect(userId: string, socketId: string): Promise<void>;
  onDisconnect(userId: string): Promise<void>;
  get(userId: string): Promise<string | undefined | null>;
}
