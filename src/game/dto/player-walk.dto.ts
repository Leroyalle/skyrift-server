import { InputType, Field } from '@nestjs/graphql';
import { PositionDto } from '../../common/dto/position.dto';

@InputType()
export class PlayerWalkDto {
  @Field(() => PositionDto)
  position: PositionDto;

  @Field()
  characterId: string;

  @Field()
  locationId: string;
}
