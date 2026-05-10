import { GET_PING_USE_CASE_TOKEN, type GetPingUseCasePort } from 'src/realtime/connection-stats';

import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class PingUseCase {
  constructor(
    @Inject(GET_PING_USE_CASE_TOKEN) private readonly getPingUseCase: GetPingUseCasePort,
  ) {}

  public execute() {
    return this.getPingUseCase.execute();
  }
}
