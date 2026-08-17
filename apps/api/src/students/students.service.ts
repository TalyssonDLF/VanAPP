import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStudentDto, StudentGuardianDto, StudentQueryDto, UpdateStudentDto } from './dto/student.dto';

const studentSelect = { id: true, name: true, birthDate: true, document: true, status: true, notes: true, createdAt: true, updatedAt: true } satisfies Prisma.StudentSelect;
@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}
  private async ensureGuardians(guardians: StudentGuardianDto[]) {
    if (!guardians.length) return;
    const count = await this.prisma.guardian.count({ where: { id: { in: guardians.map((item) => item.guardianId) } } });
    if (count !== guardians.length) throw new BadRequestException('Um ou mais responsáveis não existem.');
  }
  private conflict(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw new ConflictException('Já existe um aluno com este documento.');
    throw error;
  }
  async create(dto: CreateStudentDto) {
    await this.ensureGuardians(dto.guardians);
    try { return await this.prisma.student.create({ data: { name: dto.name.trim(), birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined, document: dto.document, status: dto.status, notes: dto.notes, guardians: { create: dto.guardians.map((item) => ({ guardianId: item.guardianId, relationship: item.relationship })) } }, select: studentSelect }); }
    catch (error) { return this.conflict(error); }
  }
  async list(query: StudentQueryDto) {
    const search = query.search?.trim();
    const where: Prisma.StudentWhereInput = { ...(query.status && { status: query.status }), ...(search && { OR: [{ name: { contains: search, mode: 'insensitive' } }, { document: { contains: search.replace(/\D/g, '') } }] }) };
    const [data, total] = await this.prisma.$transaction([
      this.prisma.student.findMany({ where, skip: (query.page - 1) * query.pageSize, take: query.pageSize, orderBy: { name: 'asc' }, select: { ...studentSelect, _count: { select: { guardians: true } } } }), this.prisma.student.count({ where }),
    ]);
    return { data: data.map(({ _count, ...student }) => ({ ...student, guardianCount: _count.guardians })), pagination: { page: query.page, pageSize: query.pageSize, total, totalPages: Math.ceil(total / query.pageSize) } };
  }
  async findOne(id: string) {
    const student = await this.prisma.student.findUnique({ where: { id }, select: { ...studentSelect, guardians: { select: { relationship: true, guardian: { select: { id: true, name: true, phone: true, email: true } } }, orderBy: { guardian: { name: 'asc' } } } } });
    if (!student) throw new NotFoundException('Aluno não encontrado.');
    return { ...student, guardians: student.guardians.map(({ relationship, guardian }) => ({ ...guardian, relationship })) };
  }
  async update(id: string, dto: UpdateStudentDto) {
    await this.findOne(id); if (dto.guardians) await this.ensureGuardians(dto.guardians);
    try { return await this.prisma.$transaction(async (tx) => {
      const student = await tx.student.update({ where: { id }, data: { ...(dto.name !== undefined && { name: dto.name.trim() }), ...(dto.birthDate !== undefined && { birthDate: new Date(dto.birthDate) }), document: dto.document, ...(dto.status !== undefined && { status: dto.status }), notes: dto.notes }, select: studentSelect });
      if (dto.guardians) { await tx.studentGuardian.deleteMany({ where: { studentId: id } }); await tx.studentGuardian.createMany({ data: dto.guardians.map((item) => ({ studentId: id, guardianId: item.guardianId, relationship: item.relationship })) }); }
      return student;
    }); } catch (error) { return this.conflict(error); }
  }
  async remove(id: string) { await this.findOne(id); await this.prisma.student.delete({ where: { id } }); return { message: 'Aluno excluído.' }; }
}
