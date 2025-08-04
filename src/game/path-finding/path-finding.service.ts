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
    from: TCoord,
    to: TCoord,
    tileSize: number,
    map: number[][],
  ): Promise<{ x: number; y: number }[]> {
    const easyStar = this.getOrCreateEasyStar(locationId, map);

    return new Promise((resolve) => {
      easyStar.findPath(
        Math.floor(from.x / tileSize),
        Math.floor(from.y / tileSize),
        to.x,
        to.y,
        (path) => {
          console.log('path', path);
          if (!path || path.length <= 1) {
            resolve([]);
            return;
          }

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
