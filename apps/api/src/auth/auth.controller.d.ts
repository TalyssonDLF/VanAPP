import { Response } from 'express';
import { AuthenticatedRequest } from './auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    register(dto: RegisterDto, response: Response): Promise<import("./auth.types").SafeUser>;
    login(dto: LoginDto, response: Response): Promise<import("./auth.types").SafeUser>;
    me(request: AuthenticatedRequest): Promise<import("./auth.types").SafeUser>;
    logout(request: AuthenticatedRequest, response: Response): Promise<void>;
}
