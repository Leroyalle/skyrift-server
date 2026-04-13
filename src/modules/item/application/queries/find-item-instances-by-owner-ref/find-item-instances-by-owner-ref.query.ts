import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

export class FindItemInstancesByOwnerRefQuery {
  constructor(public readonly props: IEntityRef) {}
}
