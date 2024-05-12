import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetStripeSignature = createParamDecorator(
  (_data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const sig = request.headers['stripe-signature'];
    return sig;
  },
);
