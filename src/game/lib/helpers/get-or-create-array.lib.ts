export function getOrCreateArray<T = unknown>(map: Map<string, T[]>, key: string): T[] {
  let array = map.get(key);
  if (!array) {
    array = [];
    map.set(key, array);
  }
  return array;
}
