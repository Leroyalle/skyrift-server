import type { IEntityRef } from 'src/realtime/shared/types/entity-ref.type';

export class FindOwnedSkillsQuery {
  constructor(public readonly props: IEntityRef) {}
}
