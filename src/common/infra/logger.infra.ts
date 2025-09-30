import { Logger } from '@nestjs/common';

export abstract class BaseLogger {
  protected readonly logger: Logger;

  constructor() {
    this.logger = new Logger(this.constructor.name);
  }

  protected log(message: string, context?: string) {
    this.logger.log(message, context);
  }

  protected warn(message: string, context?: string) {
    this.logger.warn(message, context);
  }

  protected error(message: string, trace?: string, context?: string) {
    this.logger.error(message, trace, context);
  }

  protected debug(message: string, context?: string) {
    this.logger.debug(message, context);
  }
}
