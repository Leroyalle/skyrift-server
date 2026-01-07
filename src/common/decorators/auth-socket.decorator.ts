import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { AuthenticatedSocket } from '../types/socket/auth-socket.type';

export const AuthSocket = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthenticatedSocket => {
    return ctx.switchToWs().getClient<AuthenticatedSocket>();
  },
);
