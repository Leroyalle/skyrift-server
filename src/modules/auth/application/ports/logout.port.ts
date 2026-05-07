export interface LogoutPort {
  execute(userId: string): Promise<void>;
}
