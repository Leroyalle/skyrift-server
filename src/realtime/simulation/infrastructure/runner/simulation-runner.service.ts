import { Injectable, type OnModuleDestroy, type OnModuleInit } from '@nestjs/common';

import { SimulationTickUseCase } from '../../application/use-cases/simulation-tick.use-case';

@Injectable()
export class SimulationRunner implements OnModuleInit, OnModuleDestroy {
  private interval?: NodeJS.Timeout;

  constructor(private readonly runSimulationTickUseCase: SimulationTickUseCase) {}

  public onModuleInit() {
    this.interval = setInterval(() => {
      void this.runSimulationTickUseCase.execute();
    }, 150);
  }

  public onModuleDestroy() {
    if (this.interval) clearInterval(this.interval);
  }
}
