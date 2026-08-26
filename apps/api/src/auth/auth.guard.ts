import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { SessionPayload } from './auth.types';
import { SESSION_COOKIE_NAME } from './auth.constants';
import { AuthService } from './auth.service';
export interface AuthenticatedRequest extends Request { user: SessionPayload }
@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(
    private readonly jwt: JwtService,
    private readonly auth: AuthService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
    if (!token) {
      this.reject(request, 'session cookie missing');
      throw new UnauthorizedException('Autenticação necessária.');
    }

    try {
      const payload = await this.jwt.verifyAsync<SessionPayload>(token);
      if (!payload.sub || !Number.isInteger(payload.version)) {
        this.reject(request, 'JWT malformed');
        throw new UnauthorizedException('Sessão inválida ou expirada.');
      }

      // Check the server-side session version on every protected route. This also
      // makes logout revoke the cookie immediately outside of /auth/me.
      await this.auth.getUser(payload);
      request.user = payload;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        this.reject(request, 'user not found or session revoked');
        throw error;
      }

      const name = error instanceof Error ? error.name : '';
      const reason = name === 'TokenExpiredError'
        ? 'JWT expired'
        : name === 'JsonWebTokenError'
          ? 'JWT malformed or invalid signature'
          : 'JWT rejected';
      this.reject(request, reason);
      throw new UnauthorizedException('Sessão inválida ou expirada.');
    }
  }

  private reject(request: Request, reason: string): void {
    const requestId = request.headers?.['x-request-id'];
    this.logger.warn({
      message: `Auth rejected: ${reason}`,
      method: request.method,
      route: request.originalUrl,
      ...(typeof requestId === 'string' ? { requestId } : {}),
      status: 401,
    });
  }
}
