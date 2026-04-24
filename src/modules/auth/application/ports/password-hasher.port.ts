export interface PasswordHasherPort {
  verify(hash: string, plain: string): Promise<boolean>;
  hash(plain: string): Promise<string>;
}
