import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

import type { IBag } from '../types/bag.type';

export interface BagRepositoryPort {
  save(bag: IBag): Promise<void>;
  get(id: string): Promise<IBag | null>;
  remove(id: string): Promise<void>;
  update(bag: IBag): Promise<void>;
  getByOwner(ownerRef: IEntityRef): Promise<IBag | null>;
}
