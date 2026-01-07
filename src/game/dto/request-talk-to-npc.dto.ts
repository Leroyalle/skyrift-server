import { IsString } from 'class-validator';

export class RequestTalkToNpcDto {
  @IsString()
  npcId: string;
}
