export interface RefreshHasherPort {
  verify(hash: string, plain: string): Promise<boolean>;
  hash(plain: string): Promise<string>;
}
