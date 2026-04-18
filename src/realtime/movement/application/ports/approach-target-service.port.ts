import type { IEntityType } from 'src/realtime/shared/types/entity-ref.type';
import type { IPositionTile } from 'src/realtime/shared/types/position.type';

export interface ApproachTargetServicePort {
  execute(payload: {
    actor: ApproachActor;
    target: ApproachTargetPoint;
    location: ApproachLocation;
  }): Promise<boolean>;
}

export interface ApproachActor {
  id: string;
  type: IEntityType;
  position: IPositionTile & {
    locationId: string;
  };
}

export interface ApproachTargetPoint {
  position: IPositionTile;
}

export interface ApproachLocation {
  id: string;
  passableMap: number[][];
}
