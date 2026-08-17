import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SafeUser, SessionPayload } from './auth.types';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    register(dto: RegisterDto): Promise<{
        user: SafeUser;
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: SafeUser;
        token: string;
    }>;
    getUser(payload: SessionPayload): Promise<SafeUser>;
    logout(userId: string): Promise<void>;
    private sign;
    private safe;
}
