import { ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "../src/auth/auth.guard";
import { AuthService } from "../src/auth/auth.service";

const context = (cookies: Record<string, string> = {}) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        cookies,
        headers: {},
        method: "GET",
        originalUrl: "/students",
      }),
    }),
  }) as unknown as ExecutionContext;

describe("AuthGuard", () => {
  const jwt = { verifyAsync: jest.fn() } as unknown as JwtService;
  const auth = { getUser: jest.fn() } as unknown as AuthService;
  const guard = new AuthGuard(jwt, auth);

  beforeEach(() => jest.clearAllMocks());

  it("rejects a request without the session cookie", async () => {
    await expect(guard.canActivate(context())).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(jwt.verifyAsync).not.toHaveBeenCalled();
  });

  it("accepts a valid cookie and validates its server-side session", async () => {
    const payload = { sub: "user-1", version: 2 };
    (jwt.verifyAsync as jest.Mock).mockResolvedValue(payload);
    (auth.getUser as jest.Mock).mockResolvedValue({ id: payload.sub });

    await expect(
      guard.canActivate(context({ vanescolar_session: "valid-token" })),
    ).resolves.toBe(true);
    expect(auth.getUser).toHaveBeenCalledWith(payload);
  });

  it.each([
    ["adulterated", Object.assign(new Error("invalid signature"), { name: "JsonWebTokenError" })],
    ["expired", Object.assign(new Error("jwt expired"), { name: "TokenExpiredError" })],
  ])("returns 401 for an %s token", async (_label, error) => {
    (jwt.verifyAsync as jest.Mock).mockRejectedValue(error);
    await expect(
      guard.canActivate(context({ vanescolar_session: "bad-token" })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("rejects a revoked session on every protected route", async () => {
    (jwt.verifyAsync as jest.Mock).mockResolvedValue({ sub: "user-1", version: 0 });
    (auth.getUser as jest.Mock).mockRejectedValue(
      new UnauthorizedException("Sessão inválida ou expirada."),
    );
    await expect(
      guard.canActivate(context({ vanescolar_session: "revoked-token" })),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
