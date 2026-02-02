import { IsString } from 'class-validator';

export class RequestQuestAcceptDto {
  @IsString()
  questId: string;
}
