import { InputType } from '@nestjs/graphql';

import { EntityType } from '../types/entity/entity-type.type';

@InputType()
export class RequestAttackMoveDto {
  targetId: string;
  type: EntityType;
}
