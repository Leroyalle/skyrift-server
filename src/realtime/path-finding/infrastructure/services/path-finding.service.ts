import EasyStar from 'easystarjs';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

import { Injectable } from '@nestjs/common';

import type { PathFindingServicePort } from '../../application/ports/path-finding-service.port';

import { createEasyStarInstance } from './lib/create-easystar-instance.lib';

@Injectable()
export class PathFindingService implements PathFindingServicePort {
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

  public getDistance(
    locationId: string,
    from: IPositionTile,
    to: IPositionTile,
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

  /**
   * Просчитывает путь для сущности с учетом коллизий
   * @description просчитывает массив шагов из точки А в Б с учетом коллизий
   * @param locationId Айди локации
   * @param tilesFrom Тайловые координаты откуда
   * @param tilesTo Тайловые координаты куда
   * @param passableMap Матрица проходимости локации
   * @returns Массив шагов в формате {x, y} или null если путь не найден
   */
  public getPath(
    locationId: string,
    from: IPositionTile,
    to: IPositionTile,
    passableMap: number[][],
  ): Promise<{ x: number; y: number }[] | null> {
    const easyStar = this.getOrCreateEasyStar(locationId, passableMap);

    return new Promise(resolve => {
      easyStar.findPath(from.x, from.y, to.x, to.y, path => {
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
