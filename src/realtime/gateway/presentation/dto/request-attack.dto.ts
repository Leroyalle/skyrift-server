import type { IEntityType } from 'src/realtime/shared/types/entity-ref.type';

export interface RequestAttackDto {
  id: string;
  type: IEntityType;
}
