import { PositionDto } from 'src/common/dto/position.dto';

export interface RangeArea extends PositionDto {
  radius: number;
}
