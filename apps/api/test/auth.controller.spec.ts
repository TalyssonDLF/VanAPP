import { getCookieOptions } from "../src/auth/auth.controller";

describe("authentication cookie configuration", () => {
  it("uses a secure cross-site HttpOnly cookie in production", () => {
    expect(getCookieOptions({ NODE_ENV: "production" })).toEqual({
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
});
