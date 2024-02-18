import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetResponseScope = createParamDecorator(
  (_data: string, ctx: ExecutionContext) => {
    const response = ctx.switchToHttp().getResponse();
    return response.locals;
  },
);
