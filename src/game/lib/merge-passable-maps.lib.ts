export function mergePassableMaps(
  layers: { passableData: number[][] }[],
): number[][] {
  console.log(layers);
  let maxHeight = 0;
  let maxWidth = 0;

  for (const layer of layers) {
    maxHeight = Math.max(maxHeight, layer.passableData.length);
    for (const row of layer.passableData) {
      maxWidth = Math.max(maxWidth, row.length);
    }
  }

  const merged: number[][] = Array.from({ length: maxHeight }, (_, y) =>
    Array.from({ length: maxWidth }, (_, x) => {
      for (const layer of layers) {
        const row = layer.passableData[y];
        if (row && row[x] === 0) return 0;
      }
      return 1;
    }),
  );

  return merged;
}
