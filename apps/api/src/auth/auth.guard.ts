import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { SessionPayload } from './auth.types';
export interface AuthenticatedRequest extends Request { user: SessionPayload }
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies?.vanescolar_session as string | undefined;
    if (!token) throw new UnauthorizedException('Autenticação necessária.');
    try { request.user = await this.jwt.verifyAsync<SessionPayload>(token); return true; }
    catch { throw new UnauthorizedException('Sessão inválida ou expirada.'); }
  }
}
