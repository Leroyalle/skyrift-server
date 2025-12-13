import { IsString } from 'class-validator';

export class RequestUseItemDto {
  @IsString()
  itemId: string;
}
