import type { Response } from "express";
import { AuthController, getCookieOptions } from "../src/auth/auth.controller";
import { AuthService } from "../src/auth/auth.service";

describe("authentication cookie configuration", () => {
  it("uses a secure cross-site HttpOnly cookie in production", () => {
    expect(getCookieOptions({ NODE_ENV: "production" })).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
  });

  it("uses the production cookie on Render even without NODE_ENV", () => {
    expect(getCookieOptions({ RENDER: "true" })).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
  });

  it("recognizes a Render external URL as production", () => {
    expect(
      getCookieOptions({
        RENDER_EXTERNAL_URL: "https://vanapp-36s4.onrender.com",
      }),
    ).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
  });

  it("keeps localhost development compatible with HTTP", () => {
    expect(getCookieOptions({ NODE_ENV: "development" })).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    });
  });

  it("sets and clears the same cookie name and scope", async () => {
    const auth = {
      login: jest.fn().mockResolvedValue({
        token: "signed-token",
        user: { id: "user-1", name: "User", email: "user@example.com" },
      }),
      logout: jest.fn().mockResolvedValue(undefined),
    } as unknown as AuthService;
    const response = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    } as unknown as Response;
    const controller = new AuthController(auth);

    await controller.login(
      { email: "user@example.com", password: "valid-password" },
      response,
    );
    await controller.logout(
      { user: { sub: "user-1", version: 0 } } as never,
      response,
    );

    expect(response.cookie).toHaveBeenCalledWith(
      "vanescolar_session",
      "signed-token",
      expect.objectContaining({ path: "/", maxAge: 604800000 }),
    );
    expect(response.clearCookie).toHaveBeenCalledWith(
      "vanescolar_session",
      expect.objectContaining({ path: "/" }),
    );
    const setOptions = (response.cookie as jest.Mock).mock.calls[0][2];
    const clearOptions = (response.clearCookie as jest.Mock).mock.calls[0][1];
    expect(clearOptions).toEqual({
      httpOnly: setOptions.httpOnly,
      secure: setOptions.secure,
      sameSite: setOptions.sameSite,
      path: setOptions.path,
    });
  });
});
