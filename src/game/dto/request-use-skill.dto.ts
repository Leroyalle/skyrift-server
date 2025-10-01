import { InputType } from '@nestjs/graphql';
import { PositionDto } from 'src/common/dto/position.dto';
import { EntityRef } from '../types/entity/entity-ref.type';

@InputType()
export class RequestSkillUseDto {
  skillId: string;
  area?: PositionDto;
  targetRef?: EntityRef;
  // targetId?: string;
}
