import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

export class FindBagByOwnerRefQuery {
  constructor(public readonly ownerRef: IEntityRef) {}
}
