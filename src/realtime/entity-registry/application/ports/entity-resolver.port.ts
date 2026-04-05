import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import type { EntitySnapshot } from '../types/entity-snapshot.type';

export interface EntityResolverPort {
  getByRef(ref: IEntityRef): EntitySnapshot | null;
}
