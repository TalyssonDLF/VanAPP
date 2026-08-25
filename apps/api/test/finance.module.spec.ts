import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';

import { AuthGuard, AuthenticatedRequest } from '../src/auth/auth.guard';
import { FinanceModule } from '../src/finance/finance.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('FinanceModule authentication', () => {
  const contextFor = (request: Partial<AuthenticatedRequest>) =>
    ({
      switchToHttp: () => ({ getRequest: () => request }),
    }) as ExecutionContext;

  beforeAll(() => {
    process.env.JWT_SECRET = 'finance-module-test-secret-at-least-32-chars';
  });

  it('resolves the shared AuthGuard and accepts a valid session', async () => {
    const module = await Test.createTestingModule({ imports: [FinanceModule] })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();
    const guard = module.get(AuthGuard);
    const jwt = module.get(JwtService);
    const token = await jwt.signAsync({ sub: 'owner-1', email: 'owner@example.com' });
    const request = { cookies: { vanescolar_session: token } };

    await expect(guard.canActivate(contextFor(request))).resolves.toBe(true);
    expect(request).toHaveProperty('user.sub', 'owner-1');
  });

  it('rejects a financial request without authentication', async () => {
    const module = await Test.createTestingModule({ imports: [FinanceModule] })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    await expect(
      module.get(AuthGuard).canActivate(contextFor({ cookies: {} })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
