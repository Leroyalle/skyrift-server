import { InputType } from '@nestjs/graphql';

@InputType()
export class RequestAttackMoveDto {
  targetId: string;
}
