type Entries<T extends object> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export function toEntries<T extends object>(object: T): Entries<T> {
  return Object.entries(object) as Entries<T>;
}
