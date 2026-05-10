import { ArgumentsHost, Catch, WsExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Catch()
export class BaseWsExceptionFilter implements WsExceptionFilter {
  public catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToWs();

    const client = ctx.getClient();

    let errorPayload: any;

    if (exception instanceof WsException) {
      errorPayload = exception.getError();
    } else if (exception instanceof Error) {
      errorPayload = {
        message: exception.message,
        type: exception.name,
      };
    } else {
      errorPayload = {
        message: 'Unknown error',
      };
    }

    client.emit('error', {
      ...errorPayload,
      timestamp: Date.now(),
    });
  }
}
