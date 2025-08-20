import { InputType } from '@nestjs/graphql';
import { PositionDto } from 'src/common/dto/position.dto';

@InputType()
export class RequestSkillUseDto {
  skillId: string;
  targetId?: string;
  area?: PositionDto;
}
