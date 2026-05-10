import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import type { IBag } from '../../domain/types/bag.type';

export interface BagFacadePort {
  getByOwner(ownerRef: IEntityRef): Promise<IBag | null>;
  getById(id: IBag['id']): Promise<IBag | null>;
  create(bag: Omit<IBag, 'id'>): Promise<IBag>;
  delete(id: IBag['id']): Promise<void>;
}
