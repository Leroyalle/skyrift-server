import { InputType } from '@nestjs/graphql';

@InputType()
export class PlayerWalkDto {
  x: number;
  y: number;
  id: string;
}
