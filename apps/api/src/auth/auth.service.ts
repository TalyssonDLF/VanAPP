import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SafeUser, SessionPayload } from './auth.types';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService) {}
  async register(dto: RegisterDto): Promise<{ user: SafeUser; token: string }> {
    if (dto.password !== dto.confirmPassword) throw new BadRequestException('As senhas não coincidem.');
    const email = dto.email.trim().toLowerCase();
    try {
      const user = await this.prisma.user.create({ data: { name: dto.name.trim(), email, passwordHash: await argon2.hash(dto.password, { type: argon2.argon2id }) } });
      return { user: this.safe(user), token: await this.sign(user.id, user.sessionVersion) };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('Já existe uma conta com este e-mail.');
      throw error;
    }
  }
  async login(dto: LoginDto): Promise<{ user: SafeUser; token: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email.trim().toLowerCase() } });
    if (!user || !(await argon2.verify(user.passwordHash, dto.password))) throw new UnauthorizedException('E-mail ou senha inválidos.');
    return { user: this.safe(user), token: await this.sign(user.id, user.sessionVersion) };
  }
  async getUser(payload: SessionPayload): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.sessionVersion !== payload.version) throw new UnauthorizedException('Sessão inválida ou expirada.');
    return this.safe(user);
  }
  async logout(userId: string) { await this.prisma.user.update({ where: { id: userId }, data: { sessionVersion: { increment: 1 } } }); }
  private sign(sub: string, version: number) { return this.jwt.signAsync({ sub, version } satisfies SessionPayload); }
  private safe(user: { id: string; name: string; email: string }): SafeUser { return { id: user.id, name: user.name, email: user.email }; }
}
