import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

export class SessionTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const sessionToken = request.get('X-Session-Token');

    return !!sessionToken;
  }
}

export const SessionToken = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();
    return request.get('X-Session-Token');
  },
);

export const SessionTokenRequired = () => UseGuards(SessionTokenGuard);
