import * as EasyStar from 'easystarjs';

export function createEasyStarInstance(passableMap: number[][]): EasyStar.js {
  const easyStar = new EasyStar.js();

  easyStar.setGrid(passableMap);
  easyStar.setAcceptableTiles([1]);
  easyStar.setIterationsPerCalculation(1000);

  return easyStar;
}
