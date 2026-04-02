export function getOrCreate<K, V>(map: Map<K, V>, key: K, factory: () => V): V {
  let array = map.get(key);

  if (!array) {
    array = factory();
    map.set(key, array);
  }
  return array;
}
