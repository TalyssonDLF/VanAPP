import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as argon2 from 'argon2';
import { AuthService } from '../src/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';

const user = { id: 'user-1', name: 'João da Silva', email: 'joao@example.com', passwordHash: '', sessionVersion: 0, createdAt: new Date(), updatedAt: new Date() };

describe('AuthService', () => {
  const users = { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() };
  const prisma = { user: users } as unknown as PrismaService;
  const jwt = { signAsync: jest.fn().mockResolvedValue('signed-token') } as unknown as JwtService;
  const service = new AuthService(prisma, jwt);
  beforeEach(() => jest.clearAllMocks());

  it('cadastra usuário, normaliza o e-mail e armazena hash Argon2id', async () => {
    users.create.mockImplementation(async ({ data }: { data: typeof user }) => ({ ...user, ...data }));
    const result = await service.register({ name: ' João da Silva ', email: 'JOAO@EXAMPLE.COM', password: 'senha-segura', confirmPassword: 'senha-segura' });
    const data = users.create.mock.calls[0][0].data as typeof user;
    expect(data.email).toBe('joao@example.com');
    expect(data.passwordHash).not.toBe('senha-segura');
    expect(await argon2.verify(data.passwordHash, 'senha-segura')).toBe(true);
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('não permite e-mail duplicado', async () => {
    users.create.mockRejectedValue(new Prisma.PrismaClientKnownRequestError('duplicate', { code: 'P2002', clientVersion: '6' }));
    await expect(service.register({ name: 'João', email: 'joao@example.com', password: 'senha-segura', confirmPassword: 'senha-segura' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('autentica credenciais válidas', async () => {
    const passwordHash = await argon2.hash('senha-segura'); users.findUnique.mockResolvedValue({ ...user, passwordHash });
    await expect(service.login({ email: user.email, password: 'senha-segura' })).resolves.toMatchObject({ user: { email: user.email }, token: 'signed-token' });
  });

  it.each([['senha incorreta', { ...user, passwordHash: 'hash-invalido' }], ['usuário inexistente', null]])('rejeita %s com mensagem genérica', async (_, found) => {
    users.findUnique.mockResolvedValue(found ? { ...found, passwordHash: await argon2.hash('outra-senha') } : null);
    await expect(service.login({ email: user.email, password: 'senha-segura' })).rejects.toMatchObject({ response: { message: 'E-mail ou senha inválidos.' } });
  });

  it('valida a versão da sessão e invalida no logout', async () => {
    users.findUnique.mockResolvedValue(user); users.update.mockResolvedValue({ ...user, sessionVersion: 1 });
    await expect(service.getUser({ sub: user.id, version: 0 })).resolves.toEqual({ id: user.id, name: user.name, email: user.email });
    await service.logout(user.id);
    expect(users.update).toHaveBeenCalledWith({ where: { id: user.id }, data: { sessionVersion: { increment: 1 } } });
  });

  it('rejeita sessão inexistente ou com versão inválida', async () => {
    users.findUnique.mockResolvedValue(null);
    await expect(service.getUser({ sub: user.id, version: 0 })).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
