import { Injectable } from '@nestjs/common';

import type { ClockPort } from './clock-service.port';

@Injectable()
export class SystemClockService implements ClockPort {
  public now(): Date {
    return new Date();
  }

  public nowMs(): number {
    return Date.now();
  }
}
