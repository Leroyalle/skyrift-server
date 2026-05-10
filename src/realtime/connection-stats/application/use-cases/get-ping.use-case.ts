import { CLOCK_TOKEN, type ClockPort } from 'src/realtime/shared/infrastructure/time';

import { Inject, Injectable } from '@nestjs/common';

import type { GetPingUseCasePort } from '../ports/get-ping-use-case.port';

@Injectable()
export class GetPingUseCase implements GetPingUseCasePort {
  constructor(@Inject(CLOCK_TOKEN) private readonly clockService: ClockPort) {}

  public execute() {
    return this.clockService.nowMs();
  }
}
