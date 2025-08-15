import { InputType, Field } from '@nestjs/graphql';
import { RequestAttackMoveDto } from './request-attack-move.dto';

@InputType()
export class RequestSkillUseDto extends RequestAttackMoveDto {
  @Field()
  skillId: string;
}
