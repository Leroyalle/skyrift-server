import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRequest } from '../types/user-request.type';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<UserRequest>();
    return request.user;
  },
);
