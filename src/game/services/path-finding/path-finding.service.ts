import { Injectable } from '@nestjs/common';
import EasyStar from 'easystarjs';
import { createEasyStarInstance } from './lib/create-easystar-instance.lib';

type TCoord = { x: number; y: number };

@Injectable()
export class PathFindingService {
  private easyStarMap = new Map<string, EasyStar.js>();

  getOrCreateEasyStar(
    locationId: string,
    passableMap: number[][],
  ): EasyStar.js {
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

  getPathDistance(
    locationId: string,
    from: TCoord,
    to: TCoord,
    passableMap: number[][],
  ): Promise<number> {
    const easyStar = this.getOrCreateEasyStar(locationId, passableMap);

    console.log('[get_path_distance]', from, to);

    return new Promise((resolve) => {
      easyStar.findPath(from.x, from.y, to.x, to.y, (path) => {
        if (!path) {
          resolve(-1);
        } else {
          resolve(path.length - 1);
        }
      });

      easyStar.calculate();
    });
  }

  getPlayerPath(
    locationId: string,
    tilesFrom: TCoord,
    tilesTo: TCoord,
    map: number[][],
  ): Promise<{ x: number; y: number }[] | null> {
    const easyStar = this.getOrCreateEasyStar(locationId, map);

    return new Promise((resolve) => {
      easyStar.findPath(
        tilesFrom.x,
        tilesFrom.y,
        tilesTo.x,
        tilesTo.y,
        (path) => {
          console.log('path', path);

          if (!path) {
            resolve(null);
            return;
          }

          if (path.length <= 1) {
            resolve([]);
            return;
          }

          // TODO: если путь не найден вообще то возвращать какой-нибудь флаг -1, чтобы например деспавнить моба из-за бага при возвращении

          const steps = path.slice(1).map((p) => ({ x: p.x, y: p.y }));
          console.log('steps', steps);
          resolve(steps);
        },
      );
      easyStar.calculate();
    });
  }

  clearAll() {
    this.easyStarMap.clear();
  }
}
