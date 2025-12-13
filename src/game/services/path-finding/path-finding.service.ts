import { Injectable } from '@nestjs/common';
import EasyStar from 'easystarjs';
import { createEasyStarInstance } from './lib/create-easystar-instance.lib';

type TCoord = { x: number; y: number };

@Injectable()
export class PathFindingService {
  private easyStarMap = new Map<string, EasyStar.js>();

  private getOrCreateEasyStar(locationId: string, passableMap: number[][]): EasyStar.js {
    if (this.easyStarMap.has(locationId)) {
      return this.easyStarMap.get(locationId)!;
    }

    const easyStar = createEasyStarInstance(passableMap);
    this.easyStarMap.set(locationId, easyStar);
    return easyStar;
  }

  /**
   * @description считает количество шагов из точки А в Б с учетом коллизий
   * @param locationId айди текущей локации
   * @param from стартовые tile-координаты
   * @param to таргетные tile-координаты
   * @param passableMap матрица проходимости текущей локации
   * @returns числовое значение количества шагов к таргет позиции (@param to)
   */

  public getPathDistance(
    locationId: string,
    from: TCoord,
    to: TCoord,
    passableMap: number[][],
  ): Promise<number> {
    const easyStar = this.getOrCreateEasyStar(locationId, passableMap);

    return new Promise(resolve => {
      easyStar.findPath(from.x, from.y, to.x, to.y, path => {
        if (!path) {
          resolve(-1);
        } else {
          resolve(path.length - 1);
        }
      });

      easyStar.calculate();
    });
  }

  public getPlayerPath(
    locationId: string,
    tilesFrom: TCoord,
    tilesTo: TCoord,
    map: number[][],
  ): Promise<{ x: number; y: number }[] | null> {
    const easyStar = this.getOrCreateEasyStar(locationId, map);

    return new Promise(resolve => {
      easyStar.findPath(tilesFrom.x, tilesFrom.y, tilesTo.x, tilesTo.y, path => {
        if (!path) {
          resolve(null);
          return;
        }

        if (path.length <= 1) {
          resolve([]);
          return;
        }

        const steps = path.slice(1).map(p => ({ x: p.x, y: p.y }));
        resolve(steps);
      });
      easyStar.calculate();
    });
  }
}
