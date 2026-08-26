import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { CookieOptions, Response } from "express";
import { AuthGuard, AuthenticatedRequest } from "./auth.guard";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { SESSION_COOKIE_NAME } from "./auth.constants";
export function getCookieOptions(
  env: NodeJS.ProcessEnv = process.env,
): CookieOptions {
  const isProduction = env.NODE_ENV === "production";

  return {
    httpOnly: true,
    // Separate Render services are cross-site, so HTTPS production requests require SameSite=None.
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    path: "/",
  };
}

const cookieOptions = getCookieOptions();
const sessionCookieOptions: CookieOptions = {
  ...cookieOptions,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post("register") async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.register(dto);
    response.cookie(SESSION_COOKIE_NAME, result.token, sessionCookieOptions);
    return result.user;
  }
  @HttpCode(200) @Post("login") async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.login(dto);
    response.cookie(SESSION_COOKIE_NAME, result.token, sessionCookieOptions);
    return result.user;
  }
  @UseGuards(AuthGuard) @Get("me") me(@Req() request: AuthenticatedRequest) {
    return this.auth.getUser(request.user);
  }
  @UseGuards(AuthGuard) @HttpCode(204) @Post("logout") async logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.auth.logout(request.user.sub);
    response.clearCookie(SESSION_COOKIE_NAME, cookieOptions);
  }
}
