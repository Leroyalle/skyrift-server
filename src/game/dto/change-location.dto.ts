import { Field, InputType } from '@nestjs/graphql';
import { PositionDto } from '../../common/dto/position.dto';
@InputType()
export class ChangeLocationDto {
  @Field()
  nextLocationId: string;

  @Field(() => PositionDto)
  position: PositionDto;
}
