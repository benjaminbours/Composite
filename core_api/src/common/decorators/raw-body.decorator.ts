import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const RawBody = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    return request.rawBody || null;
  },
);
