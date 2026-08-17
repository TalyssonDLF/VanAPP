import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGuardianDto, GuardianQueryDto, UpdateGuardianDto } from './dto/guardian.dto';

const guardianSelect = { id: true, name: true, phone: true, email: true, document: true, createdAt: true, updatedAt: true } satisfies Prisma.GuardianSelect;

@Injectable()
export class GuardiansService {
  constructor(private readonly prisma: PrismaService) {}
  private conflict(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('Já existe um cadastro com este documento.');
    throw error;
  }
  async create(dto: CreateGuardianDto) {
    try { return await this.prisma.guardian.create({ data: { name: dto.name.trim(), phone: dto.phone, email: dto.email, document: dto.document }, select: guardianSelect }); }
    catch (error) { return this.conflict(error); }
  }
  async list(query: GuardianQueryDto) {
    const search = query.search?.trim();
    const where: Prisma.GuardianWhereInput = search ? { OR: [
      { name: { contains: search, mode: 'insensitive' } }, { phone: { contains: search.replace(/\D/g, '') } }, { email: { contains: search, mode: 'insensitive' } },
    ] } : {};
    const [data, total] = await this.prisma.$transaction([
      this.prisma.guardian.findMany({ where, skip: (query.page - 1) * query.pageSize, take: query.pageSize, orderBy: { name: 'asc' }, select: { ...guardianSelect, _count: { select: { students: true } } } }),
      this.prisma.guardian.count({ where }),
    ]);
    return { data: data.map(({ _count, ...guardian }) => ({ ...guardian, studentCount: _count.students })), pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } };
  }
  async findOne(id: string) {
    const guardian = await this.prisma.guardian.findUnique({ where: { id }, select: { ...guardianSelect, students: { select: { relationship: true, student: { select: { id: true, name: true, status: true } } }, orderBy: { student: { name: 'asc' } } } } });
    if (!guardian) throw new NotFoundException('Responsável não encontrado.');
    return { ...guardian, students: guardian.students.map(({ relationship, student }) => ({ ...student, relationship })) };
  }
  async update(id: string, dto: UpdateGuardianDto) {
    await this.findOne(id);
    try { return await this.prisma.guardian.update({ where: { id }, data: { ...(dto.name !== undefined && { name: dto.name.trim() }), ...(dto.phone !== undefined && { phone: dto.phone }), email: dto.email, document: dto.document }, select: guardianSelect }); }
    catch (error) { return this.conflict(error); }
  }
  async remove(id: string) { await this.findOne(id); await this.prisma.guardian.delete({ where: { id } }); return { message: 'Responsável excluído.' }; }
}
