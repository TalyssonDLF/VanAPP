import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard, AuthenticatedRequest } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
const cookie = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/' };
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('register') async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) { const result = await this.auth.register(dto); response.cookie('vanescolar_session', result.token, cookie); return result.user; }
  @HttpCode(200) @Post('login') async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) { const result = await this.auth.login(dto); response.cookie('vanescolar_session', result.token, cookie); return result.user; }
  @UseGuards(AuthGuard) @Get('me') me(@Req() request: AuthenticatedRequest) { return this.auth.getUser(request.user); }
  @UseGuards(AuthGuard) @HttpCode(204) @Post('logout') async logout(@Req() request: AuthenticatedRequest, @Res({ passthrough: true }) response: Response) { await this.auth.logout(request.user.sub); response.clearCookie('vanescolar_session', cookie); }
}
